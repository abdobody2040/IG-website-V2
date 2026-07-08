onModelBeforeCreate(function(e) {
  if (e.model.tableName() !== "services") {
    return;
  }

  function formUrlEncode(obj) {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    }
    return str.join("&");
  }

  function getStripeSecret() {
    var secret = "";
    try {
      secret = $os.getenv("STRIPE_SECRET_KEY");
    } catch (osErr) {
      // If $os is not available
    }
    if (!secret) {
      if (typeof process !== "undefined" && process.env) {
        secret = process.env.STRIPE_SECRET_KEY;
      }
    }
    return secret;
  }

  try {
    var stripeSecret = getStripeSecret();
    if (!stripeSecret) {
      console.warn("⚠️ [Stripe Sync Hook] STRIPE_SECRET_KEY is not configured. Skipping Stripe product creation.");
      return;
    }

    var title = e.model.get("title_en") || e.model.get("id") || "New Service";
    var description = e.model.get("description_en") || "";
    var active = e.model.get("active") ? "true" : "false";
    var price = Number(e.model.get("price") || 0);

    console.log("🌱 [Stripe Sync Hook] Creating Stripe Product for: " + title);

    var prodRes = $http.send({
      url: "https://api.stripe.com/v1/products",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + stripeSecret
      },
      body: formUrlEncode({
        name: title,
        description: description,
        active: active
      })
    });

    if (prodRes.statusCode < 200 || prodRes.statusCode >= 300) {
      throw new Error("Failed to create Stripe product. Status: " + prodRes.statusCode + " - " + prodRes.raw);
    }

    var prodData = JSON.parse(prodRes.raw);
    var stripeProductId = prodData.id;

    console.log("💰 [Stripe Sync Hook] Creating Stripe Price of $" + price + " for Product: " + stripeProductId);

    var priceRes = $http.send({
      url: "https://api.stripe.com/v1/prices",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + stripeSecret
      },
      body: formUrlEncode({
        product: stripeProductId,
        unit_amount: Math.round(price * 100),
        currency: "usd"
      })
    });

    if (priceRes.statusCode < 200 || priceRes.statusCode >= 300) {
      throw new Error("Failed to create Stripe price. Status: " + priceRes.statusCode + " - " + priceRes.raw);
    }

    var priceData = JSON.parse(priceRes.raw);
    var stripePriceId = priceData.id;

    e.model.set("stripe_product_id", stripeProductId);
    e.model.set("stripe_price_id", stripePriceId);

    console.log("✅ [Stripe Sync Hook] Successfully synchronized new service: " + stripeProductId + " / " + stripePriceId);
  } catch (err) {
    console.error("❌ [Stripe Sync Hook] Error creating Stripe sync details: " + err);
    throw new Error("Database hook rejected creation: " + err.message);
  }
}, "services");

onModelBeforeUpdate(function(e) {
  if (e.model.tableName() !== "services") {
    return;
  }

  function formUrlEncode(obj) {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    }
    return str.join("&");
  }

  function getStripeSecret() {
    var secret = "";
    try {
      secret = $os.getenv("STRIPE_SECRET_KEY");
    } catch (osErr) {
      // If $os is not available
    }
    if (!secret) {
      if (typeof process !== "undefined" && process.env) {
        secret = process.env.STRIPE_SECRET_KEY;
      }
    }
    return secret;
  }

  try {
    var stripeSecret = getStripeSecret();
    if (!stripeSecret) {
      console.warn("⚠️ [Stripe Sync Hook] STRIPE_SECRET_KEY is not configured. Skipping Stripe update sync.");
      return;
    }

    var original = null;
    try {
      original = $app.dao().findRecordById("services", e.model.get("id"));
    } catch (findErr) {
      console.warn("⚠️ [Stripe Sync Hook] Could not find original record by ID: " + e.model.get("id"));
    }

    if (!original) {
      return;
    }

    var currentTitle = e.model.get("title_en") || "";
    var originalTitle = original.get("title_en") || "";
    
    var currentDesc = e.model.get("description_en") || "";
    var originalDesc = original.get("description_en") || "";

    var currentActive = e.model.get("active") ? "true" : "false";
    var originalActive = original.get("active") ? "true" : "false";

    var currentPrice = Number(e.model.get("price") || 0);
    var originalPrice = Number(original.get("price") || 0);

    var stripeProductId = e.model.get("stripe_product_id") || "";
    var stripePriceId = e.model.get("stripe_price_id") || "";

    if (!stripeProductId) {
      console.log("🌱 [Stripe Sync Hook] Product ID missing for existing service. Re-creating on Stripe...");
      var prodRes = $http.send({
        url: "https://api.stripe.com/v1/products",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + stripeSecret
        },
        body: formUrlEncode({
          name: currentTitle || e.model.get("id"),
          description: currentDesc,
          active: currentActive
        })
      });

      if (prodRes.statusCode >= 200 && prodRes.statusCode < 300) {
        var prodData = JSON.parse(prodRes.raw);
        stripeProductId = prodData.id;
        e.model.set("stripe_product_id", stripeProductId);
      } else {
        throw new Error("Failed to re-create missing Stripe product: " + prodRes.raw);
      }
    } else if (currentTitle !== originalTitle || currentDesc !== originalDesc || currentActive !== originalActive) {
      console.log("🔄 [Stripe Sync Hook] Updating Stripe Product details: " + stripeProductId);
      var updateRes = $http.send({
        url: "https://api.stripe.com/v1/products/" + stripeProductId,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + stripeSecret
        },
        body: formUrlEncode({
          name: currentTitle,
          description: currentDesc,
          active: currentActive
        })
      });

      if (updateRes.statusCode < 200 || updateRes.statusCode >= 300) {
        console.warn("⚠️ [Stripe Sync Hook] Failed to update Stripe Product properties: " + updateRes.raw);
      }
    }

    if (currentPrice !== originalPrice || !stripePriceId) {
      console.log("💰 [Stripe Sync Hook] Price changed from $" + originalPrice + " to $" + currentPrice + ". Updating Stripe Price...");

      if (stripePriceId) {
        console.log("🗄️ [Stripe Sync Hook] Archiving old Stripe Price: " + stripePriceId);
        var archiveRes = $http.send({
          url: "https://api.stripe.com/v1/prices/" + stripePriceId,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + stripeSecret
          },
          body: formUrlEncode({
            active: "false"
          })
        });
        if (archiveRes.statusCode < 200 || archiveRes.statusCode >= 300) {
          console.warn("⚠️ [Stripe Sync Hook] Failed to archive old Stripe Price: " + archiveRes.raw);
        }
      }

      var priceRes = $http.send({
        url: "https://api.stripe.com/v1/prices",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + stripeSecret
        },
        body: formUrlEncode({
          product: stripeProductId,
          unit_amount: Math.round(currentPrice * 100),
          currency: "usd"
        })
      });

      if (priceRes.statusCode < 200 || priceRes.statusCode >= 300) {
        throw new Error("Failed to create new Stripe price. Status: " + priceRes.statusCode + " - " + priceRes.raw);
      }

      var priceData = JSON.parse(priceRes.raw);
      stripePriceId = priceData.id;
      e.model.set("stripe_price_id", stripePriceId);

      console.log("✅ [Stripe Sync Hook] Updated Stripe Price ID: " + stripePriceId);
    }
  } catch (err) {
    console.error("❌ [Stripe Sync Hook] Error syncing Stripe updates: " + err);
    throw new Error("Database hook rejected update: " + err.message);
  }
}, "services");
