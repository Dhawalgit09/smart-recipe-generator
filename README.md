<<<<<<< HEAD
# ChefAI - Smart Recipe Generator

A Next.js application that generates personalized recipes using AI, with both manual ingredient input and image-based ingredient recognition.

## 🚀 Features

### 1. Manual Recipe Generation
- Input ingredients manually or select from predefined list
- Set dietary preferences (vegetarian, vegan, gluten-free, etc.)
- Configure serving size, cuisine type, and cooking time
- AI-powered recipe generation using Google Gemini

### 2. Image-Based Recipe Generation ✨ NEW
- Upload food images (JPG/PNG up to 5MB)
- AI-powered ingredient detection using Gemini Vision API
- Edit detected ingredients before recipe generation
- Generate 3 unique recipes from detected ingredients
- Detailed recipe cards with nutrition information

### 3. Personalized Recommendations
- User feedback system with ratings and reviews
- Favorite recipe management
- Collaborative filtering for personalized suggestions
- MongoDB Atlas integration for data persistence

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (text + vision)
- **Database**: MongoDB Atlas with Mongoose
- **Deployment**: Vercel-ready

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Smart-recipe-Generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
=======
ChefAI - Smart Recipe Generator
A Next.js application that generates personalized recipes using AI, with both manual ingredient input and image-based ingredient recognition.

🚀 Features
1. Manual Recipe Generation
Input ingredients manually or select from predefined list
Set dietary preferences (vegetarian, vegan, gluten-free, etc.)
Configure serving size, cuisine type, and cooking time
AI-powered recipe generation using Google Gemini
2. Image-Based Recipe Generation ✨ NEW
Upload food images (JPG/PNG up to 5MB)
AI-powered ingredient detection using Gemini Vision API
Edit detected ingredients before recipe generation
Generate 3 unique recipes from detected ingredients
Detailed recipe cards with nutrition information
3. Personalized Recommendations
User feedback system with ratings and reviews
Favorite recipe management
Collaborative filtering for personalized suggestions
MongoDB Atlas integration for data persistence
🛠️ Technology Stack
Frontend: Next.js 15, React 19, TypeScript
Styling: Tailwind CSS
AI: Google Gemini API (text + vision)
Database: MongoDB Atlas with Mongoose
Deployment: Vercel-ready
📦 Installation
Clone the repository:
git clone <repository-url>
cd Smart-recipe-Generator
Install dependencies:
npm install
Set up environment variables: Create a .env.local file in the root directory:
>>>>>>> 0fc9ff2a6f4e2ab65c05ac477f6016ed58db8da1
# Gemini API Key for recipe generation
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google API Key for image-based recipe generation (same as Gemini API key)
GOOGLE_API_KEY=your_gemini_api_key_here

# MongoDB Atlas Connection String
MONGO_URI=your_mongodb_atlas_connection_string
<<<<<<< HEAD
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### API Keys Setup

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to both `NEXT_PUBLIC_GEMINI_API_KEY` and `GOOGLE_API_KEY` in `.env.local`

2. **MongoDB Atlas**:
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Add it to `MONGO_URI` in `.env.local`

## 📸 Image-Based Recipe Generation

### How It Works

1. **Upload Image**: Users can drag & drop or browse for food images
2. **Ingredient Detection**: Gemini Vision API analyzes the image and detects edible ingredients
3. **Edit Ingredients**: Users can review, edit, add, or remove detected ingredients
4. **Generate Recipes**: AI creates 3 unique recipes using the confirmed ingredients
5. **View Results**: Display recipes in responsive cards with detailed information

### API Endpoints

- `POST /api/ingredients-from-image`: Detects ingredients from uploaded images
- `POST /api/recipes-from-ingredients`: Generates recipes from ingredient list

### File Validation

- **Supported formats**: JPG, JPEG, PNG
- **Maximum size**: 5MB
- **Client-side validation**: File type and size checks
- **Server-side validation**: Additional security checks

## 🍳 Recipe Generation Features

### Manual Input
- Ingredient search and selection
- Dietary preference management
- Cuisine type selection
- Cooking time preferences
- Serving size configuration

### AI-Powered Generation
- Uses Google Gemini 1.5 Flash model
- Generates detailed step-by-step instructions
- Includes nutritional information
- Provides cooking tips and variations
- Fallback recipes if AI fails

## 🗄️ Database Schema

### Collections

1. **Users**: User preferences and feedback history
2. **Recipes**: Generated and sample recipes
3. **RecipeFeedback**: User ratings and reviews

### Key Features
- User preference learning
- Collaborative filtering
- Rating aggregation
- Favorite recipe management

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark color scheme
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Graceful error messages and fallbacks

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Make sure to add these in your deployment platform:
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `MONGO_URI`

## 🔍 API Documentation

### Image Ingredient Detection

```typescript
=======
Run the development server:
npm run dev
Open http://localhost:3000 in your browser.
🔧 Configuration
API Keys Setup
Google Gemini API Key:

Visit Google AI Studio
Create a new API key
Add it to both NEXT_PUBLIC_GEMINI_API_KEY and GOOGLE_API_KEY in .env.local
MongoDB Atlas:

Create a MongoDB Atlas account
Create a new cluster
Get your connection string
Add it to MONGO_URI in .env.local
📸 Image-Based Recipe Generation
How It Works
Upload Image: Users can drag & drop or browse for food images
Ingredient Detection: Gemini Vision API analyzes the image and detects edible ingredients
Edit Ingredients: Users can review, edit, add, or remove detected ingredients
Generate Recipes: AI creates 3 unique recipes using the confirmed ingredients
View Results: Display recipes in responsive cards with detailed information
API Endpoints
POST /api/ingredients-from-image: Detects ingredients from uploaded images
POST /api/recipes-from-ingredients: Generates recipes from ingredient list
File Validation
Supported formats: JPG, JPEG, PNG
Maximum size: 5MB
Client-side validation: File type and size checks
Server-side validation: Additional security checks
🍳 Recipe Generation Features
Manual Input
Ingredient search and selection
Dietary preference management
Cuisine type selection
Cooking time preferences
Serving size configuration
AI-Powered Generation
Uses Google Gemini 1.5 Flash model
Generates detailed step-by-step instructions
Includes nutritional information
Provides cooking tips and variations
Fallback recipes if AI fails
🗄️ Database Schema
Collections
Users: User preferences and feedback history
Recipes: Generated and sample recipes
RecipeFeedback: User ratings and reviews
Key Features
User preference learning
Collaborative filtering
Rating aggregation
Favorite recipe management
🎨 UI/UX Features
Responsive Design: Works on desktop, tablet, and mobile
Dark Theme: Professional dark color scheme
Smooth Animations: CSS transitions and hover effects
Loading States: User-friendly loading indicators
Error Handling: Graceful error messages and fallbacks
🚀 Deployment
Vercel Deployment
Push your code to GitHub
Connect your repository to Vercel
Add environment variables in Vercel dashboard
Deploy automatically
Environment Variables for Production
Make sure to add these in your deployment platform:

NEXT_PUBLIC_GEMINI_API_KEY
GOOGLE_API_KEY
MONGO_URI
🔍 API Documentation
Image Ingredient Detection
>>>>>>> 0fc9ff2a6f4e2ab65c05ac477f6016ed58db8da1
POST /api/ingredients-from-image
Content-Type: multipart/form-data

Body:
- image: File (JPG/PNG, max 5MB)

Response:
{
  "ingredients": ["tomato", "onion", "garlic"]
}
<<<<<<< HEAD
```

### Recipe Generation

```typescript
=======
Recipe Generation
>>>>>>> 0fc9ff2a6f4e2ab65c05ac477f6016ed58db8da1
POST /api/recipes-from-ingredients
Content-Type: application/json

Body:
{
  "ingredients": ["tomato", "onion", "garlic"]
}

Response:
{
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Recipe Name",
      "cuisine": "italian",
      "difficulty": "easy",
      "cook_time_min": 25,
      "servings": 4,
      "ingredients": [...],
      "steps": [...],
      "nutrition": {...},
      "dietary_tags": [...]
    }
  ]
}
<<<<<<< HEAD
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Ensure both `NEXT_PUBLIC_GEMINI_API_KEY` and `GOOGLE_API_KEY` are set
   - Verify the API key is valid and has proper permissions

2. **Image Upload Issues**:
   - Check file size (must be < 5MB)
   - Ensure file format is JPG or PNG
   - Verify network connectivity

3. **Database Connection**:
   - Check MongoDB Atlas connection string
   - Ensure IP whitelist includes your IP address
   - Verify database user credentials

### Error Handling

The application includes comprehensive error handling:
- Graceful fallbacks for API failures
- User-friendly error messages
- Automatic retry mechanisms
- Fallback recipe generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using Next.js, React, and Google Gemini AI**
=======
🐛 Troubleshooting
Common Issues
API Key Errors:

Ensure both NEXT_PUBLIC_GEMINI_API_KEY and GOOGLE_API_KEY are set
Verify the API key is valid and has proper permissions
Image Upload Issues:

Check file size (must be < 5MB)
Ensure file format is JPG or PNG
Verify network connectivity
Database Connection:

Check MongoDB Atlas connection string
Ensure IP whitelist includes your IP address
Verify database user credentials
Error Handling
The application includes comprehensive error handling:

Graceful fallbacks for API failures
User-friendly error messages
Automatic retry mechanisms
Fallback recipe generation
🤝 Contributing
Fork the repository
Create a feature branch
Make your changes
Add tests if applicable
Submit a pull request
📄 License
This project is licensed under the MIT License.

🆘 Support
For support and questions:

Create an issue in the GitHub repository
Check the troubleshooting section
Review the API documentation
Built with ❤️ using Next.js, React, and Google Gemini AI
>>>>>>> 0fc9ff2a6f4e2ab65c05ac477f6016ed58db8da1
