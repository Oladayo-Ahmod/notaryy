// This is the main page of the app

// Import the AddProductModal and ProductList components
import AddNotaryModal from "@/components/AddNotaryModal";
// import ProductList from "@/components/ProductList";

// Export the Home component
export default function Home() {
  return (
    <div>
        <AddNotaryModal />
        {/* <ProductList /> */}
    </div>
  )
}