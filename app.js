new Vue({
    el: '#app',
    data: {
        lessons: [],
        cart: [],
        orders: [],
        searchQuery: "", // Stores the search term
        currentPage: 'home',
        showForm: false,
        showPopup: false,
        showEditForm: false,
        sortKey: 'subject',
        sortOrder: 'asc',
        name: '',
        phone: '',
        newLesson: {
            id: null,
            subject: '',
            location: '',
            price: 0,
            spaces: 0,
            icon: ''
        },
        lessonToEdit: null,
        nameError: '',
        phoneError: ''
    },

    computed: {
        // Computed property to dynamically filter lessons
        filteredLessons() {
            if (!this.searchQuery) {
                return this.sortedLessons;
            }
            const query = this.searchQuery.toLowerCase();
            return this.sortedLessons.filter(lesson => {
                return (
                    lesson.subject.toLowerCase().includes(query) ||
                    lesson.location.toLowerCase().includes(query) ||
                    lesson.price.toString().includes(query) ||
                    lesson.spaces.toString().includes(query)
                );
            });
        },
        sortedLessons() {
            return this.lessons.sort((a, b) => {
                let modifier = 1;
                if (this.sortOrder === 'desc') modifier = -1;
                if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
                if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
                return 0;
            });
        },
        validCheckout() {
            return (
                this.name && /^[a-zA-Z\s]+$/.test(this.name) &&
                this.phone && /^[0-9]+$/.test(this.phone) &&
                this.cart.some(item => item.selected)
            );
        },
        totalPrice() {
            return this.cart.filter(item => item.selected).reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        cartItemCount() {
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        }
    },
    methods: {
        async fetchLessons() {
            try {
                const response = await fetch('http://localhost:3000/lessons');
                this.lessons = await response.json();
            } catch (error) {
                console.error('Error fetching lessons:', error);
            }
        },
        async fetchOrders() {
            const response = await fetch('http://localhost:3000/order_placed');
            this.orders = await response.json();
        },

        async placeOrder() {
            const order = {
                name: this.name,
                phone: this.phone,
                items: this.cart,
                total: this.totalPrice
            };

            const response = await fetch('http://localhost:3000/order_placed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                this.fetchOrders(); // Refresh order list after placing an order
                this.showPopup = false;
                this.cart = [];
                this.name = '';
                this.phone = '';
            }
        },
        toggleForm() {
            this.showForm = !this.showForm;
        },
        toggleCart() {
            if (this.cart.length === 0) {
                this.currentPage = 'home';
            } else {
                this.currentPage = this.currentPage === 'cart' ? 'home' : 'cart';
            }
        },
        async addLesson() {
            if (this.newLesson.subject && this.newLesson.location && this.newLesson.price && this.newLesson.spaces) {
                try {
                    const response = await fetch('http://localhost:3000/lessons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(this.newLesson)
                    });
                    const addedLesson = await response.json();
                    this.lessons.push(addedLesson);
                    this.newLesson = { subject: '', location: '', price: 0, spaces: 0, icon: '' };
                    this.showForm = false;
                } catch (error) {
                    console.error('Error adding lesson:', error);
                }
            }
        },
        editLesson(lesson) {
            this.lessonToEdit = { ...lesson };
            this.showEditForm = true;
        },
        async saveEditedLesson() {
            if (this.lessonToEdit && this.lessonToEdit.id) {
                try {
                    const response = await fetch(`http://localhost:3000/lessons/${this.lessonToEdit.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(this.lessonToEdit)
                    });
                    if (!response.ok) throw new Error('Failed to update lesson');
                    
                    // Update lesson in the lessons array
                    const updatedLesson = await response.json();
                    const index = this.lessons.findIndex(lesson => lesson.id === updatedLesson.id);
                    if (index !== -1) {
                        this.$set(this.lessons, index, updatedLesson);
                    }
                    this.showEditForm = false;
                } catch (error) {
                    console.error('Error updating lesson:', error);
                }
            }
        },
        async deleteLesson(id) {
            if (id) {
                try {
                    const response = await fetch(`http://localhost:3000/lessons/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete lesson');
                    
                    // Remove the lesson from the lessons array
                    this.lessons = this.lessons.filter(lesson => lesson.id !== id);
                } catch (error) {
                    console.error('Error deleting lesson:', error);
                }
            }
        },
        addToCart(lesson) {
            if (lesson.spaces > 0) {
                lesson.spaces--;
                const item = this.cart.find(i => i._id === lesson._id);
                item ? item.quantity++ : this.cart.push({ ...lesson, quantity: 1, selected: true });
            }
        },
        
        removeFromCart(item) {
            const lesson = this.lessons.find(lesson => lesson.id === item.id);
            
            // Increment the spaces of the lesson being removed
            if (lesson) lesson.spaces += item.quantity;
        
            // Use the exact reference of the item to remove it only once
            const itemIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
            if (itemIndex !== -1) {
                this.cart.splice(itemIndex, 1); // Remove only the specific item
            }
        
            // Redirect to home if the cart is empty
            if (this.cart.length === 0) {
                this.currentPage = 'home';
            }
        },
        
        increaseQuantity(item) {
            const lesson = this.lessons.find(lesson => lesson.id === item.id);
            if (lesson && lesson.spaces > 0) {
                lesson.spaces--;
                item.quantity++;
            }
        },
        decreaseQuantity(item) {
            if (item.quantity > 1) {
                const lesson = this.lessons.find(lesson => lesson.id === item.id);
                if (lesson) lesson.spaces++;
                item.quantity--;
            }
        },
        validateName() {
            if (!/^[a-zA-Z\s]+$/.test(this.name)) {
                this.nameError = 'Only letters and spaces are allowed';
            } else {
                this.nameError = '';
            }
        },
        validatePhone() {
            if (!/^[0-9]+$/.test(this.phone)) {
                this.phoneError = 'Only numbers are allowed';
            } else {
                this.phoneError = '';
            }
        },
        checkout() {
            this.placeOrder();
            this.validateName();
            this.validatePhone();
            if (this.validCheckout) {
                this.showPopup = true;
            }
        },
        closePopup() {
            this.showPopup = false;
            this.cart = [];
            this.name = '';
            this.phone = '';
            this.nameError = '';
            this.phoneError = '';
            this.currentPage = 'home'; // Redirect to home after checkout is complete
        }
    },
    mounted() {
        this.fetchLessons();
        this.fetchOrders();
    }
});
