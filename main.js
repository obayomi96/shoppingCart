'use strict';

// Listening for clicks on each button

let cart = (JSON.parse(localStorage.getItem('cart')) || []);
const cartDOM = document.querySelector('.cart');
const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');

if (cart.length > 0) {
  cart.forEach(cartItem => {
    const product = cartItem;
    insertItemToDOM(product);
    saveCart();
    
    addToCartButtonsDOM.forEach(addToCartButtonDOM => {
      const productDOM = addToCartButtonDOM.parentNode;

      if (productDOM.querySelector('.product__name').innerText === product.name) {
        handleCartButton(addToCartButtonDOM, product);
      }
    });

  });
}

addToCartButtonsDOM.forEach(addToCartButtonDOM => {
  addToCartButtonDOM.addEventListener('click', () => {
    const productDOM = addToCartButtonDOM.parentNode;
    const product = {
      image: productDOM.querySelector('.product__image').getAttribute('src'),
      name: productDOM.querySelector('.product__name').innerText,
      price: productDOM.querySelector('.product__price').innerText,
      quantity: 1
    };

// Adding products to the cart
    
     const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

    if (!isInCart) {
      insertItemToDOM(product);    
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      saveCart();
      handleCartButton(addToCartButtonDOM, product);
    }
  });
});

// Inserting cart items and small buttons to the cart DOM

function insertItemToDOM(product) {
    cartDOM.insertAdjacentHTML('beforeend', `
      <div class="cart__item">
        <img class="cart__item__image" src="${product.image}" alt="${product.name}">
        <h3 class="cart__item__name">${product.name}</h3>
        <h3 class="cart__item__price">${product.price}</h3>
        <button class="btn btn--primary btn--small${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_ITEM">&minus;</button>
        <h3 class="cart__item__quantity">${product.quantity}</h3>
        <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
        <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
      </div>
    `);
    
    addCartFooter();
}

// Cart buttons event handers

function handleCartButton(addToCartButtonDOM, product) {
    addToCartButtonDOM.innerText = 'Added To Cart';
    addToCartButtonDOM.disabled = true;
      
// Increasing quantity
      
    const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
    cartItemsDOM.forEach(cartItemDOM => {
    if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {
      cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
      cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
      cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
    }
  });
}

// Increasing cart item quantity

function increaseItem(product, cartItemDOM) {
    cart.forEach(cartItem => {
      if (cartItem.name === product.name) {
        cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
        cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn-danger');
        localStorage.setItem('cart', JSON.stringify(cart));
        saveCart();
      }
    });
}

// Decreasing cart item quantity

function decreaseItem(product, cartItemDOM, addToCartButtonDOM) {
    cart.forEach(cartItem => {
     if(cartItem.name === product.name) {
      if(cartItem.quantity > 1) {
          cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
          localStorage.setItem('cart', JSON.stringify(cart));
          saveCart();
      } else {
          removeItem(product, cartItemDOM, addToCartButtonDOM);
      }
      
      if(cartItem.quantity === 1) {
          cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
      }
     }
    });
}

// Removing items from the cart

function removeItem(product, cartItemDOM, addToCartButtonDOM) {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
        cart = cart.filter(cartItem => cartItem.name !== product.name);
        localStorage.setItem('cart', JSON.stringify(cart));
        addToCartButtonDOM.innerText = 'Add To Cart';
        addToCartButtonDOM.disabled = false;

      if(cart.length < 1){
          document.querySelector('.cart-footer').remove();
      }
}

// Add button to Clear the cart

function addCartFooter(cartDOM){
    if(document.querySelector('.cart-footer') === null){
        cartDOM.inserAdjacentHTML('afterend', `
        <div class="cart-footer">
            <button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
            <button class="btn btn--primary" data-action="CHECKOUT">Pay</button>        
        </div>
    `);
    
    document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
    document.querySelector('[data-action="CHECkOUT"]').addEventListener('click', () => checkout());
    }    
}

// Clearing the cart event

function clearCart() {
    cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
    });
    
    cart = [];
    localStorage.remove('cart');
    document.querySelector.('cart-footer').remove();
    
    addToCartButtonsDOM.forEach(addToCartButtonDOM => {
        addToCartButtonDOM.innerText = 'Add To Cart';
        addToCartButtonDOM.disabled = false;
    });
}

function checkout() {
    let paypalFormHTML = `
    <form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
        <input type="hidden" name="cmd" value="_cart">
        <input type="hidden" name="upload" value="1">
        <input type="hidden" name="business" value="martinsoluwaseun47@gmail.com">
        `;
        
    cart.forEach((cartItem, index) => {
        ++index;
       paypalFormHTML += `
        <input type="hidden" name="item_name_${index}" value="${cartItem.name}">
        <input type="hidden" name="amount_${index}" value="${cartItem.price}">
        <input type="hidden" name="quantity_${index}" value="${cartItem.quantity}">
       `; 
    });    
        
        paypalFormHTML += `
        <input type="submit" value="PayPal">
    </form>
    <div class="overlay"></div>
    `;
    document.querySelector('body').insertAdjacentHTML('beforeend', paypalFormHTML);
    document.getElementById('paypal-form').sumbit();
}

// Calculate total Payment and render to DOM pay button

function countCartTotal() {
    let cartTotal = 0;
    cart.forEach(cartItem => cartTotal += cartItem.quantity * cartItem.price);
    document.querySelector('[data-action="CHECKOUT"]').innerText = `Pay $${cartTotal}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    countCartTotal();
}