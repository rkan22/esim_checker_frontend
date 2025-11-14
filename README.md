# eSIM Status Checker - Frontend

React-based frontend application for checking eSIM status and processing renewals with a professional, modern UI.

## 🚀 Features

- **eSIM Status Search**: Check status across multiple providers
- **Real-time Data Display**: Live data consumption and remaining balance
- **Donut Chart Visualization**: Visual representation of data usage
- **Bundle Renewal**: One-click renewal with Stripe checkout
- **Currency Selection**: Choose between USD and EUR
- **Professional UI**: Modern design inspired by esimstatus.com
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Copy to Clipboard**: Easy copying of ICCID, activation codes, etc.

---

## 📋 Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher (or yarn)
- Backend API running on `http://localhost:8000`

---

## 🔧 Installation

### 1. Navigate to Frontend Directory

```bash
cd esim_status_checker/frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api/esim

# Stripe Public Key
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Application Settings
REACT_APP_NAME=eSIM Status Checker
REACT_APP_SUPPORT_EMAIL=support@esimstatus.com

# Optional: Analytics, etc.
# REACT_APP_GA_TRACKING_ID=UA-XXXXX-Y
```

---

## 🎯 Running the Application

### Development Server

```bash
npm start
```

Or with yarn:

```bash
yarn start
```

Application will be available at: `http://localhost:3000`

The page will automatically reload when you make changes.

### Production Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Test the Build

```bash
npm install -g serve
serve -s build
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   ├── favicon.ico         # App icon
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   │   ├── SimpleRenewalDialog.jsx    # Renewal dialog
│   │   └── EmailDialog.jsx            # Email sending dialog
│   ├── pages/              # Page components
│   │   ├── RenewalSuccess.jsx         # Payment success page
│   │   └── RenewalCancelled.jsx       # Payment cancelled page
│   ├── services/           # API services
│   │   ├── api.js                     # Axios configuration
│   │   ├── esimService.js             # eSIM API calls
│   │   ├── renewalService.js          # Renewal API calls
│   │   └── currencyService.js         # Currency conversion
│   ├── App.js              # Main app with router
│   ├── HomePage.js         # Main eSIM checker component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🎨 Key Components

### HomePage.js

Main component for eSIM status checking:

```jsx
// Features:
- ICCID search with validation
- Multi-API status checking
- Data visualization with donut chart
- Renewal initiation
- Copy to clipboard functionality
- Professional card-based layout
```

### SimpleRenewalDialog.jsx

Renewal dialog component:

```jsx
// Features:
- Current plan details display
- Currency selection (USD/EUR)
- Real-time price conversion
- Stripe checkout integration
- Clean, minimal UI
```

### RenewalSuccess.jsx

Payment success page:

```jsx
// Features:
- Order details display
- Payment confirmation
- Status indication
- Email notification info
- Return to home navigation
```

---

## 🔌 API Integration

### eSIM Service

```javascript
// Check eSIM status
import { checkESIMStatus } from './services/esimService';

const data = await checkESIMStatus(iccid);
```

### Renewal Service

```javascript
// Create renewal order
import { createRenewalOrder } from './services/renewalService';

const result = await createRenewalOrder({
  iccid: '8932042000010245583',
  provider: 'TRAVELROAM',
  amount: 10.00,
  currency: 'USD',
  plan_name: 'eSIM, 1GB, 7 Days, Turkey, V2',
  country_code: 'TR'
});

// Confirm payment
const order = await confirmPayment({ session_id: sessionId });
```

### Currency Service

```javascript
// Convert currency
import { convertAmount } from './services/currencyService';

const converted = await convertAmount(10, 'USD', 'EUR');
```

---

## 🎨 Styling

### Material-UI (MUI)

The app uses Material-UI v5 for components:

```jsx
import { Button, TextField, Card, CircularProgress } from '@mui/material';
```

### Custom Colors

Based on esimstatus.com design:

```css
--primary-blue: #1e3a8a      /* Dark blue */
--accent-teal: #0891b2       /* Teal accents */
--success-green: #10b981     /* Success states */
--warning-orange: #f59e0b    /* Warnings */
--error-red: #ef4444         /* Errors */
--text-gray: #64748b         /* Secondary text */
```

### Responsive Breakpoints

```css
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px
```

---

## 📊 Charts & Visualization

### Recharts

Used for donut chart visualization:

```jsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

<PieChart width={200} height={200}>
  <Pie
    data={chartData}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    dataKey="value"
  >
    {chartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={colors[index]} />
    ))}
  </Pie>
</PieChart>
```

---

## 💳 Payment Integration

### Stripe Checkout

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Redirect to checkout
const { checkout_url } = await createRenewalOrder(data);
window.location.href = checkout_url;
```

### Payment Flow

```
1. User clicks "Renew Plan"
2. SimpleRenewalDialog opens
3. User selects currency
4. Click "Proceed to Payment"
5. Create order via API
6. Redirect to Stripe Checkout
7. User completes payment
8. Redirect back to /renewal/success
9. Verify payment with backend
10. Show success/failure message
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

---

## 🔧 Environment Variables

### Development (.env.development)

```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api/esim
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### Production (.env.production)

```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api/esim
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...
```

### Access in Code

```javascript
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const stripeKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to AWS S3

```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Configure CloudFront for SPA routing
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/esim-checker/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔒 Security

### Environment Variables

- Never commit `.env` files
- Use different keys for development/production
- Rotate API keys regularly

### API Security

```javascript
// API client with interceptors
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth tokens (if needed)
apiClient.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

---

## 📱 Features Guide

### Search eSIM

1. Enter ICCID in the search box
2. Click "Search" button
3. Wait for status to load (~12 seconds)
4. View complete eSIM details

### Renew Plan

1. Check eSIM status (must be expired/inactive)
2. Click "Renew Plan" button
3. Review plan details
4. Select currency (USD or EUR)
5. Click "Proceed to Payment"
6. Complete Stripe checkout
7. View success page

### Copy Details

Click any copy button next to:
- ICCID
- Order/SIM ID
- Activation Code
- APN

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to backend"**
```bash
# Check if backend is running
curl http://localhost:8000/api/esim/health/

# Check CORS settings in backend
# Check REACT_APP_API_BASE_URL in .env
```

**2. "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. "Stripe not loading"**
```bash
# Check Stripe public key in .env
# Verify REACT_APP_STRIPE_PUBLIC_KEY is set
# Check browser console for errors
```

**4. "Payment redirect not working"**
```bash
# Check success_url in renewal order creation
# Verify React Router is configured correctly
# Check browser console for navigation errors
```

### Debug Mode

```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// View in components
if (localStorage.getItem('debug')) {
  console.log('Debug info:', data);
}
```

---

## 📈 Performance Optimization

### Code Splitting

```javascript
// Lazy load components
const RenewalSuccess = React.lazy(() => import('./pages/RenewalSuccess'));

<Suspense fallback={<CircularProgress />}>
  <RenewalSuccess />
</Suspense>
```

### Memoization

```javascript
// Memoize expensive calculations
const chartData = useMemo(() => {
  return calculateChartData(esimData);
}, [esimData]);

// Memoize callbacks
const handleSearch = useCallback(() => {
  fetchESIMStatus(iccid);
}, [iccid]);
```

### Image Optimization

```bash
# Compress images
npm install imagemin-cli -g
imagemin public/*.png --out-dir=public/optimized
```

---

## 🎨 Customization

### Change Color Scheme

Edit `src/index.css` or `src/HomePage.js`:

```css
/* Primary colors */
--primary-color: #1e3a8a;
--accent-color: #0891b2;

/* Update MUI theme */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',
    },
    secondary: {
      main: '#0891b2',
    },
  },
});
```

### Change Logo

Replace `public/favicon.ico` and update:
```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
```

---

## 📞 Support

### Resources

- [React Documentation](https://reactjs.org/)
- [Material-UI Docs](https://mui.com/)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Recharts Guide](https://recharts.org/)

### Getting Help

1. Check browser console for errors
2. Review network tab for API calls
3. Check backend logs
4. Verify environment variables
5. Test with different browsers

---

## 📝 Scripts

```json
{
  "start": "react-scripts start",        // Development server
  "build": "react-scripts build",        // Production build
  "test": "react-scripts test",          // Run tests
  "eject": "react-scripts eject"         // Eject from CRA
}
```

---

## 🔄 Version History

### v1.0.0 (Current)
- eSIM status checking
- Multi-provider support
- Bundle renewal with Stripe
- Currency conversion
- Professional UI design
- Donut chart visualization
- Responsive layout

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

[Your License Here]

---

**Built with ❤️ using React, Material-UI, and Stripe**

**Last Updated**: November 14, 2025  
**Status**: Production Ready ✅
