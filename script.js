// ✅ Ensure affiliate coupon persists across pages
// ✅ Ensure affiliate coupon persists across pages
(function () {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('coupon');
    const storedCode = localStorage.getItem('appliedCoupon');

    if (urlCode && urlCode !== storedCode) {
        // New coupon provided via URL -> store and force re-validate
        localStorage.setItem('appliedCoupon', urlCode);
        localStorage.removeItem('appliedCouponData');

        // Persist across subdomains
        const parts = location.hostname.split('.');
        const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : location.hostname;
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `ref_coupon_code=${encodeURIComponent(urlCode)}; path=/; domain=.${baseDomain}; expires=${expires}`;
    } else if (!storedCode) {
        // No coupon in storage -> attempt restore from cookie
        const match = document.cookie.match(/(?:^|; )ref_coupon_code=([^;]+)/);
        if (match) {
            try {
                localStorage.setItem('appliedCoupon', decodeURIComponent(match[1]));
            } catch (e) {
                console.error('Failed to restore coupon from cookie', e);
            }
        }
    }
})();

// Debug helpers
console.log("[DEBUG] Top of script.js");
// Reuse URL coupon later in the script
const urlCoupon = new URLSearchParams(window.location.search).get('coupon');

// Add a short delay to check what survives
setTimeout(() => {
    console.log("[DEBUG] After 100ms: appliedCoupon =", localStorage.getItem('appliedCoupon'));
    console.log("[DEBUG] After 100ms: appliedCouponData =", localStorage.getItem('appliedCouponData'));
}, 100);

// Add another check after everything loads
window.addEventListener('load', () => {
    console.log("[DEBUG] On window load: appliedCoupon =", localStorage.getItem('appliedCoupon'));
});


// ✅ Global Coupon State
let couponApplied = false;
let appliedCouponCode = "";
let appliedCouponData = null;

// ✅ Capture any stored coupon state for later logic
const storedCode = localStorage.getItem('appliedCoupon');
const validated = localStorage.getItem('appliedCouponData');
if (storedCode) {
    appliedCouponCode = storedCode;
}

console.log("[DEBUG] Initial appliedCoupon in localStorage:", localStorage.getItem('appliedCoupon'));
console.log("[DEBUG] Initial appliedCouponData in localStorage:", localStorage.getItem('appliedCouponData'));

// ✅ Main DOMContentLoaded
console.log("[DEBUG] DOMContentLoaded fired");
console.log("[DEBUG] appliedCoupon:", localStorage.getItem('appliedCoupon'));
console.log("[DEBUG] appliedCouponData:", localStorage.getItem('appliedCouponData'));
document.addEventListener("DOMContentLoaded", () => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    const savedData = localStorage.getItem('appliedCouponData');

    // If coupon code exists but not validated, apply it now
    if (savedCoupon && !savedData) {
        const input = document.getElementById('couponCode');
        const button = document.getElementById('applyCouponButton');

        if (input && button) {
            input.value = savedCoupon;
            const fakeEvent = { target: button };
            applyCoupon(fakeEvent); // this sets appliedCouponData once validated
        }

        // Delay updates to allow coupon to validate
        setTimeout(() => {
            updateCartSummary();
            updateCheckoutSummary();
        }, 400);
    }
    else if (savedCoupon && savedData) {
        couponApplied = true;
        appliedCouponCode = savedCoupon;
        appliedCouponData = JSON.parse(savedData);

        const input = document.getElementById('couponCode');
        const button = document.getElementById('applyCouponButton');
        const message = document.getElementById('couponMessage');

        if (input) input.value = savedCoupon;
        if (button) button.textContent = "Remove Coupon";
        if (message) {
            message.textContent = `Coupon applied: ${appliedCouponData.percent}% off`;
            message.style.color = 'green';
        }

        updateCartSummary();
        updateCheckoutSummary();
    }
    else {
        updateCartSummary();
        updateCheckoutSummary();
    }

    updateCartCount();
});


// Updated Add to Cart with Quantity Adjuster
function addToCart(productId, name, price, description) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1; // Default to 1 if no input field

    console.log("DOM Quantity Value:", quantity); // Logs the quantity retrieved
      
    console.log(`Retrieved quantity for ${productId}: ${quantity}`);
    if (isNaN(quantity) || quantity < 1) {
        console.log(`Invalid quantity for ${productId}: Defaulting to 1`);
        return;
    }

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
        alert('This item is already in the cart!');
        return;
    }

    // Add the item to the cart with the selected quantity
    cart.push({ id: productId, name, price, quantity, description });
    localStorage.setItem('cart', JSON.stringify(cart));

    console.log("Cart after adding item:", JSON.parse(localStorage.getItem('cart'))); // Logs updated cart

    // Update the cart count immediately
    updateCartCount();

    // Update the Add to Cart button
    const button = document.querySelector(`#add-to-cart-${productId}`);
    if (button) {
        button.innerText = 'View Cart';
        button.onclick = () => (window.location.href = 'cart.php');
    }
}

// Adjust quantity for the product
function adjustQuantity(productId, change) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (!quantityInput) {
        console.log(`Quantity input not found for ${productId}`);
        return;
    }

    let currentQuantity = parseInt(quantityInput.value);
    if (isNaN(currentQuantity)) {
        console.log(`Invalid quantity value for ${productId}`);
        currentQuantity = 1; // Default to 1 if invalid
    }

    currentQuantity = Math.max(1, currentQuantity + change); // Prevent less than 1
    quantityInput.value = currentQuantity;

    console.log(`Quantity updated for ${productId}: ${currentQuantity}`);
}

function applyCoupon(event) {
    const codeInput = document.getElementById('couponCode');
    const button = event?.target || document.getElementById('applyCouponButton');
    const messageElement = document.getElementById('couponMessage');
    console.log("[DEBUG] applyCoupon() triggered");

    if (!codeInput) return;

    const enteredCode = codeInput.value.trim();
    if (!enteredCode) {
        messageElement.textContent = "Please enter a coupon code.";
        messageElement.style.color = "red";
        return;
    }

    // Remove if already applied (toggle behavior)
    if (couponApplied && appliedCouponCode === enteredCode) {
        couponApplied = false;
        appliedCouponCode = "";
        appliedCouponData = null;
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('appliedCouponData');
        updateCartSummary();
        messageElement.textContent = "Coupon removed.";
        messageElement.style.color = "black";
        return;
    }

// Validate the coupon via POST so server and client use the same logic
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = cart.map(item => item.id);

    fetch('validate-coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: enteredCode, products })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                appliedCouponCode = enteredCode;
                appliedCouponData = data;
                couponApplied = true;
                localStorage.setItem('appliedCoupon', enteredCode);
                localStorage.setItem('appliedCouponData', JSON.stringify(data));

                messageElement.textContent = `Coupon applied: ${data.percent}% off`;
                messageElement.style.color = "green";
                updateCartSummary();
            } else {
                // ❌ Invalid coupon
                messageElement.textContent = "Error validating coupon.";
                messageElement.style.color = "red";
                localStorage.removeItem('appliedCoupon');
                localStorage.removeItem('appliedCouponData');
                couponApplied = false;
                appliedCouponCode = "";
                appliedCouponData = null;
            }
        })
        .catch(error => {
            console.error("Error validating coupon:", error);
            messageElement.textContent = "Server error. Please try again later.";
            messageElement.style.color = "red";
        });
}


function updateCartSummary() {
    console.log("[DEBUG] updateCartSummary: appliedCouponData =", localStorage.getItem('appliedCouponData'));
    const cartContainer = document.querySelector('.cart-summary');
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

     appliedCouponCode = localStorage.getItem('appliedCoupon') || "";
    const rawCouponData = localStorage.getItem('appliedCouponData');
    appliedCouponData = rawCouponData ? JSON.parse(rawCouponData) : null;
    // Consider coupon applied only when both code and validated data exist
    couponApplied = !!(appliedCouponCode && appliedCouponData);

    let subtotal = 0;
    let quantityDiscount = 0;
    let couponDiscount = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        let itemQuantityDiscount = 0;
        if (item.id === 'SLS-1' && item.quantity > 1) {
            itemQuantityDiscount = (item.quantity - 1) * 250;
            quantityDiscount += itemQuantityDiscount;
        }

        if (appliedCouponData && (appliedCouponData.product === 'ALL' || appliedCouponData.product === item.id)) {
            const discountedItemTotal = itemTotal - itemQuantityDiscount;
            couponDiscount += discountedItemTotal * (appliedCouponData.percent / 100);
        }
    });

    const grandTotal = subtotal - quantityDiscount - couponDiscount;

    cartContainer.innerHTML = `
        <h2>Cart Summary</h2>
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)} USD</p>
        <p><strong>Quantity Discount:</strong> -$${quantityDiscount.toFixed(2)} USD</p>
        <p><strong>Coupon Discount:</strong> -$${couponDiscount.toFixed(2)} USD</p>
        <p><strong>Grand Total:</strong> $${grandTotal.toFixed(2)} USD</p>

        <div class="coupon-container" style="margin-top: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 10px;">
            <label for="couponCode" style="font-weight: bold; display: block; margin-bottom: 8px;">Have a Coupon Code?</label>
            <input type="text" id="couponCode" placeholder="Enter coupon code" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px;">
                       <button id="applyCouponButton" onclick="applyCoupon(event)" style="width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Apply</button>
            <p id="couponMessage" style="margin-top: 8px;"></p>
        </div>

        <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
    `;

    // Update coupon input and button if coupon already applied
    if (appliedCouponData && appliedCouponCode) {
              const input = document.getElementById('couponCode');
        const button = document.getElementById('applyCouponButton');
        if (input && button) {
            input.value = appliedCouponCode;
            button.textContent = "Remove Coupon";
        }
    }

    localStorage.setItem('appliedDiscountAmount', couponDiscount.toFixed(2));

      // ✅ Apply coupon after DOM render if a code exists but data is missing
    if (appliedCouponCode && !appliedCouponData && typeof applyCoupon === 'function') {
        setTimeout(() => {
                  const input = document.getElementById('couponCode');
            const button = document.getElementById('applyCouponButton');
            if (input && button) {
                input.value = appliedCouponCode;
                const fakeEvent = { target: button };
                applyCoupon(fakeEvent);
            }
        }, 300); // delay ensures DOM is fully rendered
    }
}


// Function to Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector(".cart-count").innerText = totalQuantity;
}

// Call it immediately on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    const isCartPage = document.querySelector('.cart-items-container') !== null;
    if (isCartPage) {
    loadCartItems();
    setTimeout(updateCartSummary, 200); // Delay summary update to wait for DOM render
}
});

// Function to link the Proceed to Checkout button to checkout.php
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty. Add items before proceeding to checkout.");
        return;
    }
    window.location.href = "checkout.php";
}

// Ensure checkout summary updates on page load and when shipping option changes
document.addEventListener("DOMContentLoaded", () => {
    updateCartSummary();
    updateCheckoutSummary(); // ✅ Ensure this function exists elsewhere in your script

    // ✅ Listen for changes in shipping options and update checkout summary dynamically
    document.querySelectorAll("input[name='shipping-option']").forEach(option => {
        option.addEventListener("change", updateCheckoutSummary);
    });
});


// Update Item Quantity
function updateCartItem(productId, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    // Prevent quantity from going below 1
    if (item.quantity < 1) item.quantity = 1;

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Reload cart items to reflect changes in the UI
    loadCartItems();

    // Update the cart count in the header
    updateCartCount();
}

// Remove Item from Cart
function removeCartItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId); // Remove item from cart
    localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in localStorage
    loadCartItems(); // Refresh the cart display
    updateCartCount(); // Update the cart count in the header
}

// Synchronize cart on the cart page
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items-container');

    Array.from(cartItemsContainer.querySelectorAll('.cart-item')).forEach((cartItem) => {
        const productId = cartItem.dataset.productId;
        const quantityInput = cartItem.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value);

        const cartItemIndex = cart.findIndex((item) => item.id === productId);
        if (cartItemIndex > -1) {
            cart[cartItemIndex].quantity = quantity;
        }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
}



 // Centralized Countries Array (Updated List)
const countries = [
  "-- Please Select --",
  "Australia", "Canada", "United States", "United Kingdom", "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "Finland", "France", "Germany", "Hong Kong", "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"];


// Function to Populate Countries in Dropdown
function populateCountries() {
    const shippingCountry = document.getElementById("shipping-country");

    if (!shippingCountry) {
        console.warn("Shipping country dropdown element not found!");
        return;
    }

    shippingCountry.innerHTML = countries.map(
        country => `<option value="${country}">${country}</option>`
    ).join("");
}


// ✅ Function to Validate the Checkout Form
function validateCheckoutForm() {
    const termsCheckbox = document.getElementById("agree-terms");
    const shippingCountry = document.getElementById("shipping-country").value;
    const shippingAddressFields = document.querySelectorAll("#shipping-name, #shipping-address1, #shipping-city, #shipping-state, #shipping-zip, #buyer-email, #buyer-phone");

    const address1 = document.getElementById("shipping-address1").value.trim();
    const address2 = document.getElementById("shipping-address2") ? document.getElementById("shipping-address2").value.trim() : ""; 
    const email = document.getElementById("buyer-email").value.trim();

    // ✅ Ensure terms are agreed
    if (!termsCheckbox.checked) {
        alert("❌ You must agree to the terms and conditions.");
        return false;
    }

    // ✅ Validate Shipping Country (Must Be Selected)
    if (shippingCountry === "-- Please Select --") {
        alert("❌ Please select a country for the Shipping Address.");
        return false;
    }

    // ✅ Validate Shipping Address Fields (Always Required)
    for (let field of shippingAddressFields) {
        if (!field.value.trim()) {
            alert(`❌ Please fill in the required field: ${field.placeholder || field.id}`);
            return false;
        }
    }

    // ✅ Reject email addresses in Address fields
    if (address1.includes("@") || address2.includes("@")) {
        alert("❌ Email addresses are not allowed in Address fields. Please enter a valid street address.");
        return false; // Prevent form submission
    }

    // ✅ Validate Email Format (Must contain @ and a valid domain extension)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        alert("❌ Please enter a valid email address (e.g., name@example.com)");
        return false; // Prevent form submission
    }
	// ✅ Validate Order Comments (Must be at least 50 characters)
const orderComments = document.getElementById("order-comments").value.trim();
if (orderComments.length < 50) {
    alert("❌ Please provide a brief description of your lawsuit (at least 50 characters).");
    return false;
}


    return true; // ✅ Allow form submission if all checks pass
}

// ✅ Single Event Listener for "DOMContentLoaded"
document.addEventListener("DOMContentLoaded", () => {
    populateCountries();
    updateCartCount();
    configurePayPalButtons();

    const summarySubtotal = document.getElementById("summary-subtotal");
    if (summarySubtotal) updateCheckoutSummary();

    // ✅ Terms and Conditions Modal Logic
    const termsLink = document.getElementById("terms-link");
    const termsModal = document.getElementById("terms-modal");
    const closeModal = document.getElementById("close-modal");

    if (termsLink && termsModal && closeModal) {
        termsLink.addEventListener("click", function (event) {
            event.preventDefault();
            termsModal.classList.add("active"); // Show modal
        });

        closeModal.addEventListener("click", function () {
            termsModal.classList.remove("active"); // Hide modal
        });

        window.addEventListener("click", function (event) {
            if (event.target === termsModal) {
                termsModal.classList.remove("active");
            }
        });
    }
});



function updateShippingOptions() {
    const shippingOptionsContainer = document.getElementById("shipping-options");
    if (!shippingOptionsContainer) return;

    // Define the shipping option
    const option = {
        name: "Tracked & Signed Delivery to Court (or Direct Lawyer Release)",
        price: 0.00
    };

    // Inject HTML for single shipping method with bonus note
    shippingOptionsContainer.innerHTML = `
       <div id="shipping-options" class="shipping-option-block">
  <div class="shipping-option">
    <input type="radio" name="shipping-option" value="0.00" id="shipping-0" checked required>
    <label for="shipping-0"><strong>Tracked & Signed Court Delivery (or Direct Lawyer Release)</strong> – $0.00 USD</label>
  </div>
  <div class="shipping-humor">
    🧷 Paper Clip Included — Free of Charge (Unlike a Lawyer Who’d Bill You $5)
  </div>
</div>


    `;

    // Update checkout data with this shipping option
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    checkoutData.shipping = option.price;
    checkoutData.shippingOption = option.name;
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // Update summary display
    updateCheckoutSummary();
}

// Add Event Listeners for Country Selection
document.addEventListener("DOMContentLoaded", () => {
    const shippingCountry = document.getElementById("shipping-country");

    if (shippingCountry) shippingCountry.addEventListener("change", updateShippingOptions);

    updateShippingOptions(); // Ensure shipping options are set on page load
});


// Function to Update Checkout Summary
function updateCheckoutSummary() {
    console.log("[DEBUG] updateCartSummary: appliedCouponData =", localStorage.getItem('appliedCouponData'));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

     appliedCouponCode = localStorage.getItem('appliedCoupon') || "";
    const rawCouponData = localStorage.getItem('appliedCouponData');
    appliedCouponData = rawCouponData ? JSON.parse(rawCouponData) : null;
    // Treat coupon as applied only when we also have validated data
    couponApplied = !!(appliedCouponCode && appliedCouponData);

      // ✅ Auto-apply coupon if we have a code but no validated data yet
    if (appliedCouponCode && !appliedCouponData && typeof applyCoupon === 'function') {
        const input = document.getElementById('couponCode');
        if (input) {
            input.value = appliedCouponCode;
            const button = document.getElementById('applyCouponButton');
            if (button) {
                const fakeEvent = { target: button };
                setTimeout(() => applyCoupon(fakeEvent), 300);
            }
        }
        return; // Skip summary update until coupon is validated
    }

    let subtotal = 0;
    let quantityDiscount = 0;
    let couponDiscount = 0;

    cart.forEach((item) => {
        subtotal += item.price * item.quantity;

        let itemQuantityDiscount = 0;
        if (item.id === 'SLS-1' && item.quantity > 1) {
            itemQuantityDiscount = (item.quantity - 1) * 250;
            quantityDiscount += itemQuantityDiscount;
        }

        if (appliedCouponData && (appliedCouponData.product === 'ALL' || appliedCouponData.product === item.id)) {
            const discountedItemTotal = item.price * item.quantity - itemQuantityDiscount;
            couponDiscount += discountedItemTotal * (appliedCouponData.percent / 100);
        }
    });

    const selectedShippingOption = document.querySelector("input[name='shipping-option']:checked");
    const shippingCost = selectedShippingOption ? parseFloat(selectedShippingOption.value) : 0;
    const shippingOptionName = selectedShippingOption ? selectedShippingOption.getAttribute("data-name") : "Unknown Shipping Option";

    const discountedSubtotal = subtotal - quantityDiscount;
    const grandTotal = discountedSubtotal - couponDiscount + shippingCost;

    document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)} USD`;
    document.getElementById("summary-discount").textContent = `-$${quantityDiscount.toFixed(2)} USD`;

    const couponLine = document.getElementById("summary-coupon-line");
    const couponCodeSpan = document.getElementById("summary-coupon-code");
    const couponDiscountSpan = document.getElementById("summary-coupon-discount");
    if (couponLine && couponCodeSpan && couponDiscountSpan) {
        if (couponDiscount > 0) {
            couponLine.style.display = 'block';
            couponCodeSpan.textContent = appliedCouponData ? appliedCouponData.code : '';
            couponDiscountSpan.textContent = `$${couponDiscount.toFixed(2)}`;
        } else {
            couponLine.style.display = 'none';
        }
    }

    document.getElementById("summary-shipping").textContent = `$${shippingCost.toFixed(2)} USD (${shippingOptionName})`;
    document.getElementById("summary-total").textContent = `$${grandTotal.toFixed(2)} USD`;

    localStorage.setItem('appliedDiscountAmount', couponDiscount.toFixed(2));
    localStorage.setItem("checkoutData", JSON.stringify({ subtotal, quantityDiscount, couponDiscount, shipping: shippingCost, shippingOption: shippingOptionName, grandTotal }));
}


// ✅ Listen for changes to shipping options and update checkout summary
document.addEventListener("DOMContentLoaded", function () {
    const shippingOptionsContainer = document.getElementById("shipping-options");

    if (shippingOptionsContainer) {
  shippingOptionsContainer.addEventListener("change", function () {
        updateCheckoutSummary();
    });
}

    updateCheckoutSummary(); // ✅ Ensure correct values on page load
});

// Ensure Functions Are Called on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    populateCountries();
    updateCartCount();

    // Call updateCheckoutSummary only if the elements exist
    if (document.getElementById("summary-subtotal")) {
        updateCheckoutSummary();
    }

    // Hide shipping address section by default, only if it exists
    const shippingAddressSection = document.getElementById("shipping-address-section");
    if (shippingAddressSection) {
        shippingAddressSection.style.display = "none";
    }
});


// Function to Configure PayPal Buttons
function configurePayPalButtons() {
    paypal.Buttons({
        createOrder: function (data, actions) {
            if (!validateCheckoutForm()) {
                return actions.reject();
            }

            // ✅ Fetch Cart & Checkout Data
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
             const checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || { subtotal: 0, discount: 0, shipping: 0, grandTotal: 0 };
            const shippingCost = parseFloat(checkoutData.shipping) || 0;
            const shippingOptionName = checkoutData.shippingOption || "Unknown Shipping Option";
            const shippingAddress = getShippingAddress();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

            // ✅ Apply Discount Per Item Before Sending to PayPal
            const discountedItems = [];


cart.forEach((item) => {
    if (item.id === "SLS-1") {
        // First one is full price, rest discounted
        if (item.quantity >= 1) {
            discountedItems.push({
                name: item.name,
                unit_amount: { currency_code: "USD", value: item.price.toFixed(2) },
                quantity: 1,
                sku: item.id
            });
        }
        if (item.quantity > 1) {
            const discountedPrice = item.price - 250;
            discountedItems.push({
                name: item.name + " (Lifetime Discount Applied)",
                unit_amount: { currency_code: "USD", value: discountedPrice.toFixed(2) },
                quantity: item.quantity - 1,
                sku: item.id + "-discounted"
            });
        }
    } else {
        // All other items (like court monitoring, phone call)
        discountedItems.push({
            name: item.name,
            unit_amount: { currency_code: "USD", value: item.price.toFixed(2) },
            quantity: item.quantity,
            sku: item.id
        });
    }
});


            // ✅ Recalculate Totals Based on Discounts and Shipping
            const itemTotal = discountedItems.reduce((sum, item) => sum + (parseFloat(item.unit_amount.value) * item.quantity), 0);
            const couponDiscount = parseFloat(checkoutData.couponDiscount || checkoutData.discount || 0);
            const validDiscount = Math.max(0, Math.min(couponDiscount, itemTotal));
            const grandTotal = itemTotal - validDiscount + shippingCost; // ✅ Include discount and shipping

            const breakdown = {
                    item_total: { currency_code: "USD", value: itemTotal.toFixed(2) },
                    shipping: { currency_code: "USD", value: shippingCost.toFixed(2) }
            };
            if (validDiscount > 0) {
                    breakdown.discount = { currency_code: "USD", value: validDiscount.toFixed(2) };
            }

            return actions.order.create({
    purchase_units: [
        {
            amount: {
                currency_code: "USD",
                value: grandTotal.toFixed(2),
                breakdown: breakdown
            },
            shipping: {
                name: { full_name: shippingAddress.name },
                address: shippingAddress
            },
            items: discountedItems
        }
    ]
});

        },
        onApprove: function (data, actions) {
    return actions.order.capture().then(function (details) {
        const selectedShippingOption = document.querySelector("input[name='shipping-option']:checked")?.nextSibling.textContent.trim() || 'Unknown';

const couponCode = localStorage.getItem('appliedCoupon') || 'None';
const discountAmount = parseFloat(localStorage.getItem('appliedDiscountAmount') || '0') || 0.00;

const cart = JSON.parse(localStorage.getItem('cart')) || [];
const totals = JSON.parse(localStorage.getItem('checkoutData')) || {};

const orderData = {
    orderId: details.id,
    paymentDetails: details,
    cart: cart,
    email: document.getElementById("buyer-email").value,
    buyerEmail: document.getElementById("buyer-email").value,
    buyerPhone: document.getElementById("buyer-phone").value,
    orderComments: document.getElementById("order-comments").value || '',
    companyName: document.getElementById("shipping-company-name").value || '',
    shippingOption: selectedShippingOption,
    couponCode: couponCode,
    discount: discountAmount,
    grandTotal: totals.grandTotal || 0,
    quantityDiscount: totals.quantityDiscount || 0
};


        // Send data to order-handler.php
        fetch('order-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                localStorage.removeItem("cart"); // Clear the cart
                window.location.href = "thank-you.php"; // Redirect to Thank You page
            } else {
                console.error('Error sending email:', result.error);
                alert('There was an issue processing your order. Please contact support.');
            }
        })
               .catch(error => {
            console.error('Fetch error:', error);
            alert('There was an issue processing your order. Please contact support.');
        });
    });
},

    }).render("#paypal-button-container");
}


function getCountryCode(countryName) {
    const countryCodes = {
        "Canada": "CA",
        "United States": "US",
        "Mexico": "MX",
        "Argentina": "AR",
        "Brazil": "BR",
        "Chile": "CL",
        "Colombia": "CO",
        "Peru": "PE",
        "United Kingdom": "GB",
        "Germany": "DE",
        "France": "FR",
        "Italy": "IT",
        "Spain": "ES",
        "Netherlands": "NL",
        "Sweden": "SE",
        "Poland": "PL",
        "Portugal": "PT",
        "Ireland": "IE",
        "Belgium": "BE",
        "Austria": "AT",
        "Switzerland": "CH",
        "Norway": "NO",
        "Finland": "FI",
        "Denmark": "DK",
        "India": "IN",
        "China": "CN",
        "Hong Kong": "HK",
        "Japan": "JP",
        "South Korea": "KR",
        "Philippines": "PH",
        "Malaysia": "MY",
        "Singapore": "SG",
        "Thailand": "TH",
        "Vietnam": "VN",
        "Indonesia": "ID",
        "Taiwan": "TW",
        "Pakistan": "PK",
        "United Arab Emirates": "AE",
        "Saudi Arabia": "SA",
        "Israel": "IL",
        "Australia": "AU",
        "New Zealand": "NZ",
        "South Africa": "ZA",
        "Nigeria": "NG",
        "Kenya": "KE",
        "Egypt": "EG"
    };
    return countryCodes[countryName] || "US";
}


// Get Shipping Address from Form
function getShippingAddress() {
    return {
        name: document.getElementById("shipping-name").value.trim(),
        address_line_1: document.getElementById("shipping-address1").value.trim(),
        address_line_2: document.getElementById("shipping-address2").value.trim() || "",
        admin_area_2: document.getElementById("shipping-city").value.trim(),
        admin_area_1: document.getElementById("shipping-state").value.trim(),
        postal_code: document.getElementById("shipping-zip").value.trim(), // Ensure no spaces
        country_code: getCountryCode(document.getElementById("shipping-country").value.trim()),
    };
}


// Calculate discount amount for SLS-1
function applyDiscount(productId, quantity) {
    if (productId === 'SLS-1') {
        const extraUnits = quantity > 1 ? quantity - 1 : 0;
        return extraUnits * 250;
    }
    return 0; // No discount for other products
}

// Calculate Total Item Price After Discount
function getItemTotal(cart, totalDiscount) {
    let itemTotal = 0;
    cart.forEach(item => {
        itemTotal += applyDiscount(item.price, cart.length) * item.quantity;
    });
    return itemTotal;
}
// Redirect to Thank-You Page and Clear Cart
function onOrderSuccess() {
    localStorage.removeItem("cart"); // Clear the cart
    window.location.href = "thank-you.php"; // Redirect to the thank-you page
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items-container');

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = ''; // Clear the container

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        updateCartSummary(0, 0);
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');

        itemElement.innerHTML = `
            <img src="images/${item.id.toLowerCase()}.jpg" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h2>${item.name}</h2>
                <p>${item.description || 'No description available'}</p>
                <p class="cart-price">Price: $${item.price.toFixed(2)} USD</p>

                <div class="cart-actions" style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                    <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 5px;">
                        <button class="quantity-btn" onclick="updateCartItem('${item.id}', -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" readonly style="width: 50px; text-align: center;">
                        <button class="quantity-btn" onclick="updateCartItem('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeCartItem('${item.id}')" style="background-color: red; color: white; padding: 5px 10px; border: none; border-radius: 5px;">Remove</button>
                </div>
            </div>
        `;

        cartItemsContainer.appendChild(itemElement);

        subtotal += item.price * item.quantity;
    });

    updateCartSummary(subtotal, cart.reduce((total, item) => total + item.quantity, 0));
}





document.addEventListener("DOMContentLoaded", function () {
    const code = localStorage.getItem('appliedCoupon');
    const discountAmount = localStorage.getItem('appliedDiscountAmount');

    if (code && discountAmount) {
        const couponCodeSpan = document.getElementById('coupon-code');
        const couponDiscountSpan = document.getElementById('coupon-discount');

        if (couponCodeSpan) couponCodeSpan.textContent = code;
        if (couponDiscountSpan) couponDiscountSpan.textContent = `-$${parseFloat(discountAmount).toFixed(2)}`;

        const subtotal = parseFloat(document.getElementById('summary-subtotal').textContent.replace(/[^0-9.]/g, '')) || 0;
        const qtyDiscount = parseFloat(document.getElementById('summary-discount').textContent.replace(/[^0-9.]/g, '')) || 0;
        const shipping = parseFloat(document.getElementById('summary-shipping').textContent.replace(/[^0-9.]/g, '')) || 0;

        const grandTotal = subtotal - qtyDiscount - parseFloat(discountAmount) + shipping;
        document.getElementById('summary-total').textContent = `$${grandTotal.toFixed(2)}`;
    }
});