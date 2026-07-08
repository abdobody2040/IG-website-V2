/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "order_updates_col_id",
    "name": "order_updates",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ou_order_id",
        "name": "order_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "orders_col_id12",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "ou_status",
        "name": "status",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ou_message",
        "name": "message",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ou_created_by",
        "name": "created_by",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_order_updates_order` ON `order_updates` (`order_id`)"
    ],
    "listRule": "order_id.user = @request.auth.id || @request.auth.role = 'admin'",
    "viewRule": "order_id.user = @request.auth.id || @request.auth.role = 'admin'",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("order_updates_col_id");

  return dao.deleteCollection(collection);
})
