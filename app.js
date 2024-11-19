new Vue({
    el: '#app',
    data: {
        lessons: [
            { id: 1, subject: 'Math', location: 'London', price: 100, spaces: 5, icon: 'icon-math.png' },
            { id: 2, subject: 'Math', location: 'Oxford', price: 100, spaces: 5, icon: 'icon-math.png' },
            { id: 3, subject: 'English', location: 'London', price: 100, spaces: 5, icon: 'icon-english.png' },
            { id: 4, subject: 'English', location: 'York', price: 80, spaces: 5, icon: 'icon-english.png' },
            { id: 5, subject: 'Music', location: 'Bristol', price: 90, spaces: 5, icon: 'icon-music.png' },
            // Add more lessons here
        ],
        cart: [],
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
            }
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
