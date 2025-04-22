import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import { generateResponse } from '../config/gemini'
import ReactMarkdown from 'react-markdown'
import image from '../assets/images.jpg'
import { supabase } from './supabase'
import Chatbot from './Chatbot'

const Recipe = () => {
  const [recipeQuery, setRecipeQuery] = useState('')
  const [recipe, setRecipe] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inventory, setInventory] = useState([])
  const [missingIngredients, setMissingIngredients] = useState([])
  const [blinkitProducts, setBlinkitProducts] = useState([])

  // Common pantry items that are typically always available
  const commonPantryItems = [
    'salt', 'sugar', 'pepper', 'oil', 'water', 'flour', 'baking powder',
    'baking soda', 'vinegar', 'soy sauce', 'ketchup', 'mustard', 'honey',
    'butter', 'garlic', 'onion', 'ginger', 'chili powder', 'turmeric',
    'cumin', 'coriander', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary',
    'cinnamon', 'nutmeg', 'vanilla extract', 'lemon juice', 'lime juice',
    'rice', 'pasta', 'bread', 'milk', 'eggs', 'cheese', 'yogurt'
  ]

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('Product Data')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setInventory(data || [])
    } catch (err) {
      console.error('Error fetching inventory:', err)
    }
  }

  const extractVideoId = (url) => {
    if (!url) return '';

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return url;
    }

    // Extract video ID from URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  const findMissingIngredients = (recipeText) => {
    const ingredientsSection = recipeText.split('## Instructions')[0]
    const ingredients = ingredientsSection
      .split('\n')
      .filter(line => line.trim() && line.includes('-'))
      .map(line => line.replace('-', '').trim().toLowerCase())

    const missing = ingredients.filter(ingredient => {
      // Check if it's a common pantry item
      const isCommonPantryItem = commonPantryItems.some(item =>
        ingredient.includes(item) || item.includes(ingredient)
      )

      if (isCommonPantryItem) return false

      // Check if it's in inventory
      return !inventory.some(item =>
        item.product_name.toLowerCase().includes(ingredient) ||
        ingredient.includes(item.product_name.toLowerCase())
      )
    })

    setMissingIngredients(missing)
    return missing
  }

  const searchBlinkitProducts = async (ingredients) => {
    const products = []
    for (const ingredient of ingredients) {
      try {
        // Create a Google search URL for the ingredient
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(ingredient + ' buy online india')}`

        // Generate a random delivery time between 10-30 minutes
        const deliveryTime = Math.floor(Math.random() * 21) + 10 // Random number between 10-30

        products.push({
          ingredient,
          searchUrl,
          deliveryTime,
          // Use a placeholder image or ingredient icon
          image: `https://source.unsplash.com/200x200/?${encodeURIComponent(ingredient)}`
        })
      } catch (err) {
        console.error(`Error creating search link for ${ingredient}:`, err)
      }
    }
    setBlinkitProducts(products)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!recipeQuery.trim()) return

    setIsLoading(true)
    setError('')
    setRecipe('')
    setVideoUrl('')
    setMissingIngredients([])
    setBlinkitProducts([])

    try {
      // Create a list of available ingredients
      const availableIngredients = inventory.map(item => item.product_name).join(', ')

      // First, get the recipe
      const recipePrompt = `You are a professional chef. I want to make: ${recipeQuery}. 
      
      This recipe will be displayed in markdown editor. Make it visually appealing and attractive using:
      - 🎨 Emojis for each section and ingredients
      - 📝 Clear hierarchical headings (H1, H2, H3)
      - 📋 Well-formatted bullet points and numbered lists
      - 💡 Tips in blockquotes
      - ⏱️ Time and servings in bold
      - 🥘 Ingredients with checkboxes
      - 🔍 Important notes in italics
      
      Here are the ingredients I currently have in my inventory:
      ${availableIngredients}
      
      Please provide a detailed recipe that uses as many of my available ingredients as possible. If some ingredients are missing, suggest alternatives or mark them as optional. Include the following sections in markdown format:
      
      # 🍳 [Recipe Name]
      
      ## 📋 Quick Info
      - ⏱️ **Prep Time**: [time]
      - 🔥 **Cook Time**: [time]
      - 👥 **Servings**: [number]
      - 🎯 **Difficulty**: [Easy/Medium/Hard]
      
      ## 🛒 Ingredients
      ### Available Ingredients
      - [ ] [ingredient] - ✅ (in your inventory)
      
      ### Missing Ingredients
      - [ ] [ingredient] - ❌ (need to purchase)
      
      ## 👩‍🍳 Instructions
      1. [Step 1]
      2. [Step 2]
      ...
      
      ## 💡 Tips & Notes
      > [Important tips and variations]
      
      Format the response in proper markdown with appropriate headings and lists. Make it visually appealing and easy to read.`

      const recipeResult = await generateResponse(recipePrompt)
      setRecipe(recipeResult)

      // Find missing ingredients
      const missing = findMissingIngredients(recipeResult)
      if (missing.length > 0) {
        await searchBlinkitProducts(missing)
      }

      // Then, get a relevant YouTube video URL
      const videoPrompt = `For the recipe "${recipeQuery}", provide a full YouTube URL of a good tutorial video. 
      The URL should be in the format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID.
      Return ONLY the URL, nothing else.`

      const videoResult = await generateResponse(videoPrompt)
      setVideoUrl(videoResult.trim())
    } catch (err) {
      setError('Failed to generate recipe. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const videoId = extractVideoId(videoUrl)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Chatbot />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Recipe Generator</h1>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-wrap content-center justify-center gap-4">
              <input
                type="text"
                value={recipeQuery}
                onChange={(e) => setRecipeQuery(e.target.value)}
                placeholder="What recipe would you like to make? (e.g., chocolate cake, pasta carbonara)"
                className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-900"
              >
                {isLoading ? 'Generating...' : 'Generate Recipe'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 mb-4 text-red-200 bg-red-900/50 rounded-lg">
              {error}
            </div>
          )}

          {recipe && (
            <div className="space-y-8">
              {/* {videoId && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-white">Video Tutorial</h2>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Recipe Tutorial"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[400px] rounded-lg"
                    ></iframe>
                  </div>
                </div>
              )} */}

              <div className="prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg shadow-lg text-gray-300 overflow-auto">
                <div className="max-h-[800px] overflow-y-auto">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-white" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-3 text-white" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xl font-medium mb-2 text-white" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-4" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4" {...props} />
                    }}
                  >
                    {recipe}
                  </ReactMarkdown>
                </div>
              </div>

              {missingIngredients.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col content-center items-center">
                  <h2 className="text-2xl font-bold mb-4 text-white">Any Missing Ingredient?</h2>
                  <div className=" gap-4">
                    {/* {blinkitProducts.map((item, index) => ( */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Order Now</h3>
                      <img
                        src={image}
                        alt="blinkit"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <div className="flex items-center text-green-400 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Estimated delivery: Few minutes</span>
                      </div>
                      <a
                        href="https://blinkit.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Search Online
                      </a>
                    </div>
                    {/* ))} */}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Recipe
