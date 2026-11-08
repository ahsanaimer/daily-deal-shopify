export function cartLinesDiscountsGenerateRun(input) {
  const emptyResult = { operations: new Array() };

  const rawConfig = input.shop?.metafield?.value;
  if (!rawConfig) return emptyResult;

  const config = JSON.parse(rawConfig);
  const customPrice = parseFloat(config.custom_price);
  const dealHandle = config.product_handle;

  if (!dealHandle || isNaN(customPrice)) {
    return emptyResult;
  }

  // Check if deal countdown timer has expired
  if (config.end_time) {
    const endTimestamp = new Date(config.end_time).getTime();
    if (!isNaN(endTimestamp) && Date.now() > endTimestamp) {
      return emptyResult;
    }
  }

  const candidates = new Array();

  for (const line of input.cart.lines) {
    const productHandle = line.merchandise?.product?.handle;
    const currentUnitPrice = parseFloat(line.cost.amountPerQuantity.amount);

    if (productHandle === dealHandle && currentUnitPrice > customPrice) {
      const discountPerUnit = (currentUnitPrice - customPrice).toFixed(2);

      candidates.push({
        message: config.badge_text || "Deal of the Day Price",
        targets: [
          {
            cartLine: {
              id: line.id,
            },
          },
        ],
        value: {
          fixedAmount: {
            amount: discountPerUnit,
            appliesToEachItem: true,
          },
        },
      });
    }
  }

  if (candidates.length === 0) {
    return emptyResult;
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "FIRST",
          candidates,
        },
      },
    ],
  };
}
