/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)

  // 1. Update existing rules
  try {
    const users = dao.findCollectionByNameOrId("_pb_users_auth_")
    users.updateRule = "id = @request.auth.id && (@request.data.role:isset = false || @request.auth.role = 'admin')"
    dao.saveCollection(users)
  } catch (e) { console.log(e) }

  try {
    const orders = dao.findCollectionByNameOrId("orders")
    orders.createRule = "@request.auth.id != '' && @request.data.user = @request.auth.id"
    dao.saveCollection(orders)
  } catch (e) { console.log(e) }

  try {
    const documents = dao.findCollectionByNameOrId("documents")
    documents.createRule = "@request.auth.id != '' && @request.data.user = @request.auth.id"
    dao.saveCollection(documents)
  } catch (e) { console.log(e) }

  // 2. Create rate_limits
  try {
    const rateLimits = new Collection({
      name: "rate_limits",
      type: "base",
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      schema: [
        { system: false, id: "rtlimip1", name: "ip", type: "text", required: false, options: { max: 100 } },
        { system: false, id: "rtlimusr", name: "user_id", type: "text", required: false, options: { max: 100 } },
        { system: false, id: "rtlimend", name: "endpoint", type: "text", required: true, options: { max: 100 } },
        { system: false, id: "rtlimcnt", name: "count", type: "number", required: true, options: {} },
        { system: false, id: "rtlimres", name: "reset_time", type: "number", required: true, options: {} }
      ]
    })
    dao.saveCollection(rateLimits)
  } catch (e) { console.log(e) }

}, (db) => {
  const dao = new Dao(db)

  try {
    const users = dao.findCollectionByNameOrId("_pb_users_auth_")
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    dao.saveCollection(users)
  } catch (e) {}

  try {
    const orders = dao.findCollectionByNameOrId("orders")
    orders.createRule = "@request.auth.id != ''"
    dao.saveCollection(orders)
  } catch (e) {}

  try {
    const documents = dao.findCollectionByNameOrId("documents")
    documents.createRule = "@request.auth.id != ''"
    dao.saveCollection(documents)
  } catch (e) {}

  try {
    const rateLimits = dao.findCollectionByNameOrId("rate_limits")
    dao.deleteCollection(rateLimits)
  } catch (e) {}
})
