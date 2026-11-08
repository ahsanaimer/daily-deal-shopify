export default function HelpPage() {
  return (
    <s-page heading="Setup Guide & Help">
      <s-section heading="How to Activate Daily Deal on Your Store">
        <s-stack direction="block" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text fontWeight="bold">Step 1: Configure Your Deal Product</s-text>
              <s-text>
                Go to the main Daily Deal dashboard, click Select Product, set your
                Custom Deal Price and countdown end time, and click Save Deal.
              </s-text>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text fontWeight="bold">Step 2: Enable the Header Bar in Your Theme</s-text>
              <s-text>
                Navigate to Online Store → Themes → Customize. Click the App embeds
                icon on the left sidebar, toggle Deal of the Day Bar ON, and click Save.
              </s-text>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text fontWeight="bold">Step 3: Test Dynamic Cart Pricing</s-text>
              <s-text>
                Click Claim Deal on the storefront header bar. Our Shopify Function
                automatically overrides the item price in the cart without altering
                your master catalog price in Shopify Admin.
              </s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Troubleshooting">
        <s-stack direction="block" gap="tight">
          <s-text>
            • Bar not appearing? Ensure the selected product is set to Active, has
            inventory greater than 0, and the countdown end time is in the future.
          </s-text>
          <s-text>
            • Need custom theme styling? Adjust background, text, and button colors
            directly inside the Deal of the Day Bar settings in your Theme Editor.
          </s-text>
        </s-stack>
      </s-section>
    </s-page>
  );
}
