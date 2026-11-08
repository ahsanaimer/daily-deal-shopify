import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query GetDealConfig {
      shop {
        id
        metafield(namespace: "deal_of_day", key: "config") {
          value
        }
      }
    }
  `);

  const json = await response.json();
  const shopId = json.data.shop.id;
  const rawValue = json.data.shop.metafield?.value;
  const savedConfig = rawValue ? JSON.parse(rawValue) : null;

  return { shopId, savedConfig };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const shopId = formData.get("shopId");
  const customPrice = formData.get("customPrice");
  const badgeText = formData.get("badgeText");
  const startTimeIso = new Date().toISOString();

  // 1. Save Deal Config & Custom Price to Shop Metafield (Catalog price remains untouched!)
  const configPayload = JSON.stringify({
    product_id: formData.get("productId"),
    variant_id: formData.get("variantId"),
    product_handle: formData.get("productHandle"),
    product_title: formData.get("productTitle"),
    product_image: formData.get("productImage"),
    custom_price: customPrice || "",
    badge_text: badgeText,
    end_time: new Date(formData.get("endTime")).toISOString(),
  });

  const metaResponse = await admin.graphql(
    `#graphql
    mutation SaveDealConfig($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "deal_of_day",
            key: "config",
            type: "json",
            value: configPayload,
          },
        ],
      },
    }
  );

  // 2. Ensure the Shopify Function Automatic Discount is active on the store
  const checkDiscountRes = await admin.graphql(`
    #graphql
    query CheckExistingDealDiscount {
      discountNodes(first: 10, query: "title:'Deal of the Day Auto-Discount'") {
        nodes {
          id
        }
      }
    }
  `);
  const checkDiscountJson = await checkDiscountRes.json();
  const existingDiscounts = checkDiscountJson.data?.discountNodes?.nodes || [];

  if (existingDiscounts.length === 0) {
    await admin.graphql(
      `#graphql
      mutation CreateDealAutomaticDiscount($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          automaticAppDiscount: {
            title: "Deal of the Day Auto-Discount",
            functionHandle: "deal-dynamic-price",
            startsAt: startTimeIso,
            discountClasses: ["PRODUCT"],
          },
        },
      }
    );
  }

  const result = await metaResponse.json();
  return { success: true, result };
};

export default function DealOfTheDayDashboard() {
  const { shopId, savedConfig } = useLoaderData();
  const fetcher = useFetcher();

  const [selectedProduct, setSelectedProduct] = useState(
    savedConfig
      ? {
          id: savedConfig.product_id,
          variantId: savedConfig.variant_id,
          handle: savedConfig.product_handle,
          title: savedConfig.product_title,
          image: savedConfig.product_image,
        }
      : null
  );

  const [customPrice, setCustomPrice] = useState(
    savedConfig?.custom_price || ""
  );
  const [badgeText, setBadgeText] = useState(
    savedConfig?.badge_text || "DEAL OF THE DAY"
  );
  const [endTime, setEndTime] = useState(
    savedConfig?.end_time
      ? savedConfig.end_time.slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  useEffect(() => {
    if (fetcher.data?.success && window.shopify) {
      window.shopify.toast.show("Deal & Dynamic Cart Price activated!");
    }
  }, [fetcher.data]);

  const handleSelectProduct = async () => {
    const selected = await window.shopify.resourcePicker({
      type: "product",
      multiple: false,
    });

    if (selected && selected.length > 0) {
      const product = selected.at(0);
      const firstImage = product.images?.at(0);
      const firstVariant = product.variants?.at(0);

      setSelectedProduct({
        id: product.id,
        variantId: firstVariant?.id || "",
        handle: product.handle,
        title: product.title,
        image: firstImage?.originalSrc || "",
      });

      if (!customPrice) {
        setCustomPrice(firstVariant?.price || "");
      }
    }
  };

  const handleSave = () => {
    if (!selectedProduct) return;

    fetcher.submit(
      {
        shopId,
        productId: selectedProduct.id,
        variantId: selectedProduct.variantId,
        productHandle: selectedProduct.handle,
        productTitle: selectedProduct.title,
        productImage: selectedProduct.image,
        customPrice,
        badgeText,
        endTime,
      },
      { method: "POST" }
    );
  };

  const isSaving = fetcher.state === "submitting";

  return (
    <s-page heading="Deal of the Day Manager">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleSave}
        disabled={!selectedProduct || isSaving}
      >
        {isSaving ? "Saving..." : "Save Deal"}
      </s-button>

      <s-section heading="1. Choose Featured Deal Product">
        <s-stack direction="block" gap="base">
          {selectedProduct ? (
            <s-box padding="base" borderWidth="base" borderRadius="base">
              <s-stack direction="inline" gap="base" alignItems="center">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    width="50"
                    height="50"
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                  />
                )}
                <s-stack direction="block" gap="tight">
                  <s-text fontWeight="bold">{selectedProduct.title}</s-text>
                  <s-text tone="subdued">
                    Handle: {selectedProduct.handle}
                  </s-text>
                </s-stack>
                <s-button onClick={handleSelectProduct}>Change Product</s-button>
              </s-stack>
            </s-box>
          ) : (
            <s-button onClick={handleSelectProduct}>Select Product</s-button>
          )}
        </s-stack>
      </s-section>

      <s-section heading="2. Dynamic Cart Price, Banner & Countdown">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Custom Deal Price (Cart Override)"
            type="number"
            step="0.01"
            value={customPrice}
            onInput={(e) => setCustomPrice(e.target.value)}
            helpText="Catalog price stays unchanged. Shopify Function automatically applies this price in the cart while the timer is active."
          />
          <s-text-field
            label="Badge Label"
            value={badgeText}
            onInput={(e) => setBadgeText(e.target.value)}
          />
          <div>
            <label
              htmlFor="deal-end-time"
              style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}
            >
              Deal End Date & Time
            </label>
            <input
              id="deal-end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #8c9196",
                fontSize: "14px",
              }}
            />
          </div>
        </s-stack>
      </s-section>
    </s-page>
  );
}
