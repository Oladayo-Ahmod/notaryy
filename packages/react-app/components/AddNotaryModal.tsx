// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useEffect, useState } from "react";
// import ethers to convert the product price to wei
import { ethers } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";
// import functions from pinata to upload file to IPFS and get the URI
import {uploadJSONToIPFS,uploadFileToIPFS} from '../constants/pinata.js'

// The AddProductModal component is used to add a product to the marketplace
const AddNotaryModal = () => {
    // The visible state is used to toggle the modal
    const [visible, setVisible] = useState(false);
    // The following states are used to store the values of the form fields
    const [notaryTitle, setNotaryTitle] = useState("");
    const [notaryFileURI, setNotaryFileURI] = useState("");
    const [notaryDescription, setNotaryDescription] = useState("");
    const [username, setUsername] = useState("");
    const [document, setDocument] = useState({
        notaryTitle: '',
        notaryFileURI: '',
        username: '',
        notaryDescription: ''
    });
    const [fileURIhash,setFileURIhash] = useState("")
    // const [NotaryMetadata,setNotaryMetadata] = useState({   })
    // The following states are used to store the debounced values of the form fields
    const [debouncedNotaryTitle] = useDebounce(notaryTitle, 500);
    const [debouncedNotaryFileURI] = useDebounce(notaryFileURI, 500);
    const [debouncedNotaryDescription] = useDebounce(notaryDescription, 500);
    const [debouncedUsername] = useDebounce(username, 500);
    // The loading state is used to display a loading message
    const [loading, setLoading] = useState("");


    const isComplete =
    notaryTitle &&
    notaryFileURI &&
    username &&
    notaryDescription;
    
    if(isComplete){
      const document = {
        notaryTitle,
        notaryFileURI,
        username,
        notaryDescription
      }

      setDocument(document)
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(notaryFileURI));
      setFileURIhash(hash)
    }

    // Clear the input fields after the product is added to the marketplace
    const clearForm = () => {
    setNotaryTitle("");
    setNotaryFileURI("");
    setUsername("");
    setNotaryDescription("");
  };


  // Use the useContractSend hook to use our no function on the marketplace contract and add a product to the marketplace
  const { writeAsync: notarizeDocument } = useContractSend("notarizeDocument", [
    fileURIhash,
    document
  ]);

  // Define function that handles the creation of a product through the marketplace contract
  const handleNotarizeDocument = async () => {
    if (!notarizeDocument) {
      throw "Failed to Notarize document";
    }
    setLoading("Creating...");
    if (!isComplete) throw new Error("Please fill all fields");
    // Create the product by calling the writeProduct function on the marketplace contract
    const notarize = await notarizeDocument();
    setLoading("Waiting for confirmation...");
    // Wait for the transaction to be mined
    // await notarize.wait();
    // Close the modal and clear the input fields after the product is added to the marketplace
    setVisible(false);
    clearForm();
  };

  const NotaryFileHandler = async function(e : any){
    let file = e.target.files[0]
    try {
        const response = await uploadFileToIPFS(file)
        console.log(response.pinataURL);
        setNotaryFileURI(response.pinataURL)
    } catch (error) {
        console.log(error);
    }
}
  // Define function that handles the creation of a notary, if a user submits the notary form
  const addNotary = async (e: any) => {
    e.preventDefault();
    try {
      // Display a notification while the product is being added to the marketplace
      await toast.promise(handleNotarizeDocument(), {
        pending: "Notarizing document..",
        success: "Document Notarized successfully",
        error: "Something went wrong. Try again.",
      });
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      // Clear the loading state after the product is added to the marketplace
    } finally {
      setLoading("");
    }
  };

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Add Product Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Add Product
        </button>

        {/* Modal */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the product, that triggers the addProduct function on submit */}
            <form onSubmit={addNotary}>
              <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                  &#8203;
                </span>
                <div
                  className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline"
                >
                  {/* Input fields for the document */}
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <label>Username</label>
                    <input
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Document Title</label>
                    <input
                      onChange={(e) => {
                        setNotaryTitle(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Document File</label>
                    <input
                      onChange={(e) => {
                        NotaryFileHandler(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Document Description</label>
                    <input
                      onChange={(e) => {
                        setNotaryDescription(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                  </div>
                  {/* Button to close the modal */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    {/* Button to add the product to the marketplace */}
                    <button
                      type="submit"
                      disabled={!!loading || !isComplete || !notarizeDocument}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default AddNotaryModal;