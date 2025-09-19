/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  container: {
    center: true, // Canh giữa container
    padding: '32px', // Thêm padding vào container
    screens: {
      sm: '100%', // Chiều rộng 100% trên màn hình nhỏ
      md: '900px', // Chiều rộng tối đa là 900px trên màn hình vừa
      lg: '1200px', // Chiều rộng tối đa là 1200px trên màn hình lớn
    },
  },
};
