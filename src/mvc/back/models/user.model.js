const sql = require("./db.js");
const bcrypt = require("bcryptjs");

// Constructor
const User = function(user) {
  this.name = user.name;
  this.username = user.username;
  this.email = user.email;
  if (user.password) {
    this.password = user.password;
  }
};

// --- AUTHENTICATION METHOD (Replaces old create) ---
User.create = (newUser, result) => {
  if (!newUser.password) {
    result({ message: "Password is required for registration." }, null);
    return;
  }
  // Hash the password before saving
  newUser.password = bcrypt.hashSync(newUser.password, 8);

  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    // IMPORTANT: Do not return the password hash in the response
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    
    result(null, { id: res.insertId, ...userWithoutPassword });
  });
};

// Find a user by email (needed for login)
User.findByEmail = (email, result) => {
  sql.query(`SELECT * FROM users WHERE email = ?`, [email], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

// --- PASSWORD RESET METHODS ---

// Save reset token and expiry to the database for a user
User.saveResetToken = (email, token, expire, result) => {
    sql.query(
        "UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE email = ?",
        [token, expire, email],
        (err, res) => {
            if (err) { result(err, null); return; }
            if (res.affectedRows === 0) { result({ kind: "not_found" }, null); return; }
            result(null, res);
        }
    );
};

// Find a user by a valid (non-expired) reset token
User.findByResetToken = (token, result) => {
    sql.query(
        "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpire > NOW()",
        [token],
        (err, res) => {
            if (err) { result(err, null); return; }
            if (res.length) { result(null, res[0]); return; }
            // If no user is found, or the token is expired, return "not_found"
            result({ kind: "not_found" }, null);
        }
    );
};

// Update a user's password and clear the reset token
User.updatePassword = (id, password, result) => {
    const newHashedPassword = bcrypt.hashSync(password, 8);
    sql.query(
        "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?",
        [newHashedPassword, id],
        (err, res) => {
            if (err) { result(err, null); return; }
            if (res.affectedRows === 0) { result({ kind: "not_found" }, null); return; }
            result(null, res);
        }
    );
};


// --- CRUD METHODS (Remain the same but now only for authenticated users) ---

User.findById = (id, result) => {
  // Select only non-sensitive fields
  sql.query(`SELECT id, name, username, email FROM users WHERE id = ${id}`, (err, res) => {
    if (err) { result(err, null); return; }
    if (res.length) { result(null, res[0]); return; }
    result({ kind: "not_found" }, null);
  });
};

User.getAll = (result) => {
  // Select only non-sensitive fields
  sql.query("SELECT id, name, username, email FROM users ORDER BY id DESC", (err, res) => {
    if (err) { result(err, null); return; }
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?",
    [user.name, user.username, user.email, id],
    (err, res) => {
      if (err) { result(err, null); return; }
      if (res.affectedRows === 0) { result({ kind: "not_found" }, null); return; }
      result(null, { id: id, ...user });
    }
  );
};

User.remove = (id, result) => {
  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) { result(err, null); return; }
    if (res.affectedRows === 0) { result({ kind: "not_found" }, null); return; }
    result(null, res);
  });
};

module.exports = User;