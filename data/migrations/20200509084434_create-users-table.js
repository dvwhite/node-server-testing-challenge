exports.up = function(knex) {
  return knex.schema.createTable("users", tbl => {
    tbl.increments()
    tbl.text("username")
      .unique()
      .notNullable()
    tbl.text("password")
      .notNullable()
    tbl.integer("role")
      .unsigned()
      .notNullable()
      .defaultTo(1) // 1 is a normal user, 2 is an admin user
    // Optional fields
    tbl.text("first_name")
    tbl.text("last_name")
    tbl.text("department")
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("users")
};