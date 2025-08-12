# 🛍️ Symbionet - Multi-Tenant E-commerce Platform

A modern, multi-tenant e-commerce platform built with **Next.js 15**, **Supabase**, and **TypeScript**. Enables businesses to create their own online stores with WhatsApp integration for seamless customer ordering.

## ✨ Features

### 🏪 **Multi-Tenant Architecture**

- **Individual storefronts** for each tenant with custom slugs
- **Isolated data** and user management per tenant
- **Role-based access control** (Admin/Staff roles)

### 📱 **WhatsApp Integration**

- **Direct WhatsApp ordering** from product pages
- **Configurable WhatsApp numbers** per tenant
- **Pre-filled order messages** with product details and totals

### 🛒 **Product Management**

- **Full CRUD operations** for products
- **Multiple image uploads** with drag-and-drop support
- **Inventory tracking** with stock management
- **One-click stock reduction** ("Sell One" feature)
- **Product detail pages** with image galleries
- **Out-of-stock visual indicators**

### 🎨 **Modern UI/UX**

- **Dark theme** with gradient backgrounds
- **Responsive design** for mobile and desktop
- **Loading states** and smooth animations
- **Image galleries** with thumbnail navigation
- **Clean, minimalist product cards**

### 🔐 **Authentication & Security**

- **Supabase Auth** with email/password
- **Row Level Security (RLS)** policies
- **Secure file uploads** to Supabase Storage
- **Protected admin routes**

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation:** Zod
- **Deployment:** Vercel-ready

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### 1. Clone and Install

```bash
git clone https://github.com/felipetillard/symbionet.git
cd symbionet
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

Run the SQL schema in your Supabase project:

```bash
# Execute the contents of supabase.sql in your Supabase SQL editor
```

### 4. Storage Setup

In your Supabase dashboard:

1. Create a **"product-images"** storage bucket
2. Set it to **public**
3. Configure the RLS policies (included in `supabase.sql`)

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📋 Usage

### Getting Started

1. **Sign up** for a new account
2. **Create your tenant** during onboarding
3. **Configure WhatsApp** number in settings
4. **Add products** through the admin panel
5. **Share your storefront** URL: `/t/your-tenant-slug`

### Admin Features

- **Product Management:** Add, edit, delete products
- **Inventory Control:** Track and manage stock levels
- **WhatsApp Settings:** Configure checkout phone number
- **Image Management:** Upload multiple product images

### Customer Experience

- **Browse products** on clean storefront
- **View product details** with image galleries
- **Add to cart** and review orders
- **Order via WhatsApp** with pre-filled messages

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (root)/              # Root pages
│   ├── auth/                # Authentication pages
│   ├── onboarding/          # New user onboarding
│   └── t/[tenant]/          # Tenant-specific routes
│       ├── admin/           # Admin dashboard
│       ├── product/         # Product detail pages
│       └── page.tsx         # Storefront
├── lib/
│   └── supabase/           # Supabase client configuration
└── components/             # Shared React components
```

## 🗄️ Database Schema

### Core Tables

- **`tenants`** - Store information (name, slug, WhatsApp number)
- **`tenant_members`** - User-tenant relationships with roles
- **`products`** - Product catalog with images and inventory
- **`categories`** - Product categorization
- **`orders`** - Order history and tracking

### Key Features

- **Row Level Security (RLS)** for data isolation
- **JSONB storage** for flexible product images
- **UUID primary keys** for security
- **Automatic timestamps** for audit trails

## 🔧 Configuration

### WhatsApp Setup

1. Navigate to **Settings** in your admin panel
2. Enter your **WhatsApp number** (international format: +1234567890)
3. **Test the number** using the provided link
4. Customers can now **order directly** via WhatsApp

### File Uploads

- **Maximum file size:** 10MB per upload
- **Supported formats:** JPG, PNG, WebP
- **Storage:** Supabase Storage with CDN
- **Automatic optimization:** Client-side image preview

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect your GitHub repo to Vercel
# Add environment variables in Vercel dashboard
# Deploy automatically on push
```

### Environment Variables for Production

```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/felipetillard/symbionet/issues)
- **Discussions:** [GitHub Discussions](https://github.com/felipetillard/symbionet/discussions)

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the backend infrastructure
- **Tailwind CSS** for the styling system
- **Lucide** for the beautiful icons

---

**Built with ❤️ by Felipe Tillard**
