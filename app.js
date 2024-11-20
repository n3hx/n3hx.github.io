new Vue({
    el: '#app',
    data: {
        lessons: [
            { id: 1, subject: 'Maths', location: 'Oxford', price: 45, spaces: 5, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4yfHuJrIHCC0WAY4oV6WWcKSbOfju4csWw&s' },
            { id: 2, subject: 'French', location: 'Paris', price: 13, spaces: 3, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4yfHuJrIHCC0WAY4oV6WWcKSbOfju4csWw&s' },
            { id: 3, subject: 'English', location: 'Cambridge', price: 38, spaces: 4, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4yfHuJrIHCC0WAY4oV6WWcKSbOfju4csWw&s' },
            { id: 4, subject: 'Science', location: 'York', price: 80, spaces: 1, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4yfHuJrIHCC0WAY4oV6WWcKSbOfju4csWw&s' },
            { id: 5, subject: 'Music', location: 'Bristol', price: 67, spaces: 2, icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE4yfHuJrIHCC0WAY4oV6WWcKSbOfju4csWw&s' },
            // Add more lessons here
        ],
        cart: [],
        currentPage: 'home',  // Default to Home Page
        showForm: false,  // Control visibility of the form
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
        }
    },
    computed: {
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
            return this.name && /^[a-zA-Z]+$/.test(this.name) && this.phone && /^[0-9]+$/.test(this.phone) && this.cart.some(item => item.selected);
        },
        totalPrice() {
            return this.cart.filter(item => item.selected).reduce((total, item) => total + (item.price * item.quantity), 0);
        }
    },
    methods: {
        addLesson() {
            if (this.newLesson.subject && this.newLesson.location && this.newLesson.price && this.newLesson.spaces) {
                this.newLesson.id = this.lessons.length + 1;  // Simple ID generation
                this.lessons.push({ ...this.newLesson });
                this.newLesson = { id: null, subject: '', location: '', price: 0, spaces: 0, icon: '' };  // Reset the form
                this.showForm = false;  // Close form after submission
            }
        },
        toggleForm() {
            this.showForm = !this.showForm;  // Toggle form visibility
        },
        addToCart(lesson) {
            if (lesson.spaces > 0) {
                lesson.spaces--;
                const cartItem = this.cart.find(item => item.id === lesson.id);
                if (!cartItem) {
                    this.cart.push({ ...lesson, quantity: 1, selected: false });
                } else {
                    cartItem.quantity++;
                }
            }
        },
        removeFromCart(item) {
            const lesson = this.lessons.find(lesson => lesson.id === item.id);
            lesson.spaces += item.quantity;
            this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
        },
        increaseQuantity(item) {
            const lesson = this.lessons.find(lesson => lesson.id === item.id);
            if (lesson.spaces > 0) {
                item.quantity++;
                lesson.spaces--;
            }
        },
        decreaseQuantity(item) {
            if (item.quantity > 1) {
                const lesson = this.lessons.find(lesson => lesson.id === item.id);
                item.quantity--;
                lesson.spaces++;
            }
        },
        checkout() {
            alert(`Order submitted successfully! Total: £${this.totalPrice}`);
            this.cart = [];
            this.name = '';
            this.phone = '';
        }
    }
});
