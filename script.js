document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Firebase
    if (window.firebaseAuth) {
        window.firebaseAuth.initFirebase();
        // Cargar estado de autenticación
        loadAuthState();
    }
    
    // Variables
    const downloadButtons = document.querySelectorAll('.download-btn');
    const buyButtons = document.querySelectorAll('.buy-btn');
    const newsletterForm = document.querySelector('.newsletter-form');
    const contactForm = document.getElementById('contactForm');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');
    const cartIcon = document.getElementById('cart-icon');
    const loginLink = document.getElementById('login-link');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort');
    const categorySelect = document.getElementById('category');
    const checkoutBtn = document.getElementById('checkout-btn');
    const backToCartBtn = document.getElementById('back-to-cart');
    const checkoutForm = document.getElementById('checkout-form');
    
    // Crear contenedor de notificaciones
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Eliminar la notificación después de 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Autenticación con Firebase
    let cart = [];
    
    // Función para verificar autenticación
    function checkAuth() {
        return window.firebaseAuth && window.firebaseAuth.isUserLoggedIn();
    }
    
    // Función para actualizar UI basado en autenticación
    function updateAuthUI() {
        if (loginLink) {
            const isAuthenticated = checkAuth();
            const currentUser = window.firebaseAuth ? window.firebaseAuth.getCurrentUser() : null;
            
            if (isAuthenticated && currentUser) {
                // Crear contenedor para el perfil de usuario
                if (!document.getElementById('user-profile-container')) {
                    const userProfileContainer = document.createElement('div');
                    userProfileContainer.id = 'user-profile-container';
                    userProfileContainer.className = 'user-profile-container';
                    
                    // Crear imagen de perfil
                    const userProfileImg = document.createElement('img');
                    userProfileImg.className = 'user-profile-img';
                    userProfileImg.src = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=random`;
                    userProfileImg.alt = 'Profile';
                    
                    // Crear menú desplegable
                    const userDropdown = document.createElement('div');
                    userDropdown.className = 'user-dropdown';
                    userDropdown.innerHTML = `
                        <span>${currentUser.displayName}</span>
                        <div class="dropdown-content">
                            <a href="#profile">Mi Perfil</a>
                            <a href="#orders">Mis Pedidos</a>
                            <a href="#" id="logout-btn">Cerrar Sesión</a>
                        </div>
                    `;
                    
                    // Añadir elementos al contenedor
                    userProfileContainer.appendChild(userProfileImg);
                    userProfileContainer.appendChild(userDropdown);
                    
                    // Reemplazar el enlace de login con el contenedor de perfil
                    loginLink.parentNode.replaceChild(userProfileContainer, loginLink);
                    
                    // Añadir evento para cerrar sesión
                    document.getElementById('logout-btn').addEventListener('click', async function(e) {
                        e.preventDefault();
                        try {
                            await window.firebaseAuth.logoutUser();
                            showNotification('Has cerrado sesión correctamente');
                            // Eliminar datos de autenticación del localStorage
                            localStorage.removeItem('auth');
                            // Recargar la página
                            window.location.reload();
                        } catch (error) {
                            showNotification('Error al cerrar sesión: ' + error.message, 'error');
                        }
                    });
                }
            } else {
                // Si hay un contenedor de perfil pero el usuario no está autenticado, restaurar el enlace de login
                const userProfileContainer = document.getElementById('user-profile-container');
                if (userProfileContainer) {
                    const loginLinkNew = document.createElement('a');
                    loginLinkNew.href = 'login.html';
                    loginLinkNew.id = 'login-link';
                    loginLinkNew.textContent = 'Login';
                    userProfileContainer.parentNode.replaceChild(loginLinkNew, userProfileContainer);
                } else {
                    loginLink.textContent = 'Login';
                    loginLink.href = 'login.html';
                }
            }
        }
    }
    
    // Función para actualizar contador del carrito
    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }
    
    // Función para calcular totales del carrito
    function calculateCartTotals() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.07; // 7% de impuesto
        const total = subtotal + tax;
        
        return { subtotal, tax, total };
    }
    
    // Función para actualizar resumen del carrito
    function updateCartSummary() {
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTax = document.getElementById('cart-tax');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (cartSubtotal && cartTax && cartTotal) {
            const { subtotal, tax, total } = calculateCartTotals();
            
            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            cartTax.textContent = `$${tax.toFixed(2)}`;
            cartTotal.textContent = `$${total.toFixed(2)}`;
            
            // Habilitar/deshabilitar botón de checkout
            if (checkoutBtn) {
                checkoutBtn.disabled = cart.length === 0;
            }
        }
    }
    
    // Función para renderizar items del carrito
    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        
        if (cartItemsContainer) {
            // Limpiar contenedor
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                if (emptyCartMessage) {
                    cartItemsContainer.appendChild(emptyCartMessage);
                } else {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-cart-message';
                    emptyMessage.id = 'empty-cart-message';
                    emptyMessage.innerHTML = `
                        <p>Your cart is empty</p>
                        <a href="store.html" class="hero-btn primary">Continue Shopping</a>
                    `;
                    cartItemsContainer.appendChild(emptyMessage);
                }
            } else {
                // Ocultar mensaje de carrito vacío
                if (emptyCartMessage) {
                    emptyCartMessage.style.display = 'none';
                }
                
                // Crear elementos para cada item
                cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h3 class="cart-item-title">${item.name}</h3>
                            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">×</button>
                    `;
                    
                    cartItemsContainer.appendChild(cartItem);
                });
                
                // Añadir event listeners para botones de cantidad y eliminar
                document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.dataset.id;
                        const itemIndex = cart.findIndex(item => item.id === id);
                        
                        if (itemIndex !== -1) {
                            if (cart[itemIndex].quantity > 1) {
                                cart[itemIndex].quantity--;
                            } else {
                                cart.splice(itemIndex, 1);
                            }
                            
                            // Actualizar UI
                            updateCartCount();
                            renderCartItems();
                            updateCartSummary();
                            
                            // Guardar carrito en localStorage
                            localStorage.setItem('cart', JSON.stringify(cart));
                        }
                    });
                });
                
                document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.dataset.id;
                        const itemIndex = cart.findIndex(item => item.id === id);
                        
                        if (itemIndex !== -1) {
                            cart[itemIndex].quantity++;
                            
                            // Actualizar UI
                            renderCartItems();
                            updateCartSummary();
                            
                            // Guardar carrito en localStorage
                            localStorage.setItem('cart', JSON.stringify(cart));
                        }
                    });
                });
                
                document.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.dataset.id;
                        const itemIndex = cart.findIndex(item => item.id === id);
                        
                        if (itemIndex !== -1) {
                            cart.splice(itemIndex, 1);
                            
                            // Actualizar UI
                            updateCartCount();
                            renderCartItems();
                            updateCartSummary();
                            
                            // Guardar carrito en localStorage
                            localStorage.setItem('cart', JSON.stringify(cart));
                        }
                    });
                });
            }
        }
    }
    
    // Función para renderizar items en el checkout
    function renderCheckoutItems() {
        const checkoutItemsList = document.getElementById('checkout-items-list');
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutTax = document.getElementById('checkout-tax');
        const checkoutTotal = document.getElementById('checkout-total');
        
        if (checkoutItemsList) {
            // Limpiar contenedor
            checkoutItemsList.innerHTML = '';
            
            // Crear elementos para cada item
            cart.forEach(item => {
                const checkoutItem = document.createElement('div');
                checkoutItem.className = 'checkout-item';
                checkoutItem.innerHTML = `
                    <div class="checkout-item-name">${item.name} × ${item.quantity}</div>
                    <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                `;
                
                checkoutItemsList.appendChild(checkoutItem);
            });
            
            // Actualizar totales
            const { subtotal, tax, total } = calculateCartTotals();
            
            if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            if (checkoutTax) checkoutTax.textContent = `$${tax.toFixed(2)}`;
            if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    // Cargar carrito desde localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                updateCartCount();
                
                // Si estamos en la página del carrito, renderizar items
                if (window.location.pathname.includes('cart.html')) {
                    renderCartItems();
                    updateCartSummary();
                }
            } catch (e) {
                console.error('Error loading cart:', e);
                cart = [];
            }
        }
    }
    
    // Cargar estado de autenticación desde Firebase
    function loadAuthState() {
        if (window.firebaseAuth) {
            // Escuchar cambios en el estado de autenticación
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // Usuario está autenticado
                    // Guardar información básica en localStorage para persistencia
                    const authData = {
                        isAuthenticated: true,
                        user: {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            photoURL: user.photoURL
                        }
                    };
                    localStorage.setItem('auth', JSON.stringify(authData));
                } else {
                    // Usuario no está autenticado
                    localStorage.removeItem('auth');
                }
                
                // Actualizar UI
                updateAuthUI();
            });
        }
    }
    
    // Manejar eventos de formularios de autenticación
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                // Mostrar indicador de carga
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Iniciando sesión...';
                submitBtn.disabled = true;
                
                // Iniciar sesión con Firebase
                await window.firebaseAuth.loginUser(email, password);
                
                // Mostrar notificación de éxito
                showNotification('Has iniciado sesión correctamente');
                
                // Redirigir si hay una URL guardada
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                // Mostrar error
                showNotification(`Error al iniciar sesión: ${error.message}`, 'error');
                
                // Restaurar botón
                const submitBtn = this.querySelector('.submit-btn');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            // Validar contraseñas
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Validar requisitos de contraseña
            if (password.length < 8 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
                showNotification('La contraseña debe tener al menos 8 caracteres, un número y un carácter especial', 'error');
                return;
            }
            
            try {
                // Mostrar indicador de carga
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creando cuenta...';
                submitBtn.disabled = true;
                
                // Registrar usuario con Firebase
                await window.firebaseAuth.registerUser(email, password, name);
                
                // Mostrar notificación de éxito
                showNotification('Cuenta creada correctamente. Has iniciado sesión.');
                
                // Redirigir a la página principal
                window.location.href = 'index.html';
            } catch (error) {
                // Mostrar error
                showNotification(`Error al crear cuenta: ${error.message}`, 'error');
                
                // Restaurar botón
                const submitBtn = this.querySelector('.submit-btn');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Manejar clics en botones de descarga
    if (downloadButtons) {
        downloadButtons.forEach(button => {
            button.addEventListener('click', function() {
                const product = this.dataset.product || 'software';
                const requiresAuth = this.dataset.requiresAuth === 'true';
                
                if (requiresAuth && !checkAuth()) {
                    // Redirigir a login si se requiere autenticación
                    showNotification('Debes iniciar sesión para descargar este software', 'error');
                    localStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = 'login.html';
                    return;
                }
                
                showNotification(`¡Descarga de ${product} iniciada! Gracias por elegir Arcanum.`);
                
                // Aquí se podría implementar la lógica real de descarga
                // Por ahora solo mostramos la notificación
            });
        });
    }
    
    // Manejar clics en botones de compra
    if (buyButtons) {
        buyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const product = this.dataset.product || 'software';
                const price = parseFloat(this.dataset.price) || 0;
                const requiresAuth = this.dataset.requiresAuth === 'true';
                
                if (requiresAuth && !checkAuth()) {
                    // Redirigir a login si se requiere autenticación
                    showNotification('Debes iniciar sesión para comprar este software', 'error');
                    localStorage.setItem('redirectAfterLogin', window.location.href);
                    window.location.href = 'login.html';
                    return;
                }
                
                // Obtener información del producto desde el card
                const card = this.closest('.software-card');
                const name = card.querySelector('h3').textContent;
                const image = card.querySelector('img').src;
                
                // Generar ID único para el item
                const id = product;
                
                // Verificar si el producto ya está en el carrito
                const existingItemIndex = cart.findIndex(item => item.id === id);
                
                if (existingItemIndex !== -1) {
                    // Incrementar cantidad si ya existe
                    cart[existingItemIndex].quantity++;
                } else {
                    // Añadir nuevo item al carrito
                    cart.push({
                        id,
                        name,
                        price,
                        image,
                        quantity: 1
                    });
                }
                
                // Actualizar UI
                updateCartCount();
                showNotification(`${name} añadido al carrito`);
                
                // Guardar carrito en localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
            });
        });
    }
    
    // Manejar clic en icono del carrito
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            if (!this.href.includes('cart.html')) {
                e.preventDefault();
                window.location.href = 'cart.html';
            }
        });
    }
    
    // Manejar botón de checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!checkAuth()) {
                // Redirect to login if not authenticated
                showNotification('Please log in to complete checkout', 'error');
                localStorage.setItem('redirectAfterLogin', 'checkout.html');
                window.location.href = 'login.html';
                return;
            }

            // Proceed to checkout if authenticated
            window.location.href = 'checkout.html';
        });
    }
});