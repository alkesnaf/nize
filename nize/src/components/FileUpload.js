import React, { useState, useEffect } from 'react';
import axios from "axios";
import './FileUpload.css';
import FileModal from './FileModal';
import { useTheme } from './Theme';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileContent, setSelectedFileContent] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [fileResults, setFileResults] = useState([]);
    const [modalContent, setModalContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {darkMode, toggleTheme} = useTheme();

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
      };
    
      const closeModal = () => {
        setModalContent(null);
        setIsModalOpen(false);
      };

    useEffect(() => {
        getFiles();
    }, []);
    
    const handleMenuItemClick = (itemName) => {
        alert(itemName + ' clicked!');
    };


     // Handles the selection of the file
    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]); // Update the selected file state
        setUploadStatus(''); // Optionally clear the upload status
    };


    const handleUpload = async () => {
        if (selectedFile) {
            await uploadFile(selectedFile); // If a file is selected, start the upload
        } else {
            setUploadStatus('No file selected.'); // If no file is selected, update the status
        }
    };


    const uploadFile = async (file) => {
        //call get cookie, append to formData
        const authToken = getCookie("authtoken");
        const formData = new FormData();
        formData.append("myfile", file);
        formData.append("authtoken", authToken);


        try {
            const response = await axios.post(
                "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/input-files.php",
                formData
            );

            if (response.status === 200) {
                console.log('File uploaded successfully');
                setUploadStatus('File uploaded successfully.')
            } else {
                console.log('File uploaded unsuccessfully');
                setUploadStatus('File upload failed.');
            }
        }
        catch (error) {
            setUploadStatus('An error occurred while uploading. Please try again later.');
            console.error('Upload error:', error);
        }

    };

    const getFiles = async () => {
        const authToken = getCookie("authtoken");
        console.log(authToken);
        if (!authToken) {
            window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/";
            window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/";
        } else {
            try {
                const response = await axios.get('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/fetch-files.php', {
                    params: {authtoken: authToken },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                const fileData = response.data;
                console.log("File data:", fileData);
                setFileResults(fileData);
            } catch (error) {
                console.error(error);

            }
        }

        
    };

    const renderPlaceholderImage = (file) => {
        let placeholderSrc;

        // Check the file type and set the appropriate placeholder image source
        if (file.file_type.startsWith('image/')) {
            placeholderSrc = process.env.PUBLIC_URL + '/image.png';
        } else if (file.file_type === 'application/pdf') {
            placeholderSrc = process.env.PUBLIC_URL + '/pdf.png';
        } else if (file.file_type.startsWith('text/')) {
            placeholderSrc = process.env.PUBLIC_URL + '/file.png';
        } else {
            // Use a default placeholder image for unsupported file types
            placeholderSrc = process.env.PUBLIC_URL + '/file.png';
        }

        return (
            <img
                src={placeholderSrc}
                alt={file.file_name}
                onClick={() => openModal(handleFileContentModal(file))}
            />
        );
    };

    // const handleFileContent = (file) => {
    //     if (!file.file_content || !file.file_type) {
    //         // Handle the case where file information is incomplete
    //         return <p>Error: Incomplete file information</p>;
    //     }
    
    //     // Check the file type
    //     if (file.file_type.startsWith('image/')) {
    //         // Display a placeholder image for image files
    //         return (
    //             <img
    //                 src={process.env.PUBLIC_URL + '/image_placeholder.jpg'}
    //                 alt={file.file_name}
    //                 onClick={() => openModal(handleFileContentModal(file))}
    //                 style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '200px' }}
    //             />
    //         );
    //     } else if (file.file_type === 'application/pdf') {
    //         // Display a placeholder image for PDF files
    //         return (
    //             <img
    //                 src={process.env.PUBLIC_URL + '/pdf_placeholder.jpg'}
    //                 alt={file.file_name}
    //                 onClick={() => openModal(handleFileContentModal(file))}
    //                 style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '200px' }}
    //             />
    //         );
    //     } else if (file.file_type.startsWith('text/')) {
    //         // Display a placeholder image for text files
    //         return (
    //             <img
    //                 src={process.env.PUBLIC_URL + '/text_placeholder.jpg'}
    //                 alt={file.file_name}
    //                 onClick={() => openModal(handleFileContentModal(file))}
    //                 style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '200px' }}
    //             />
    //         );
    //     } else {
    //         // Handle other file types as needed
    //         return <p>Unsupported file type: {file.file_type}</p>;
    //     }
    // };

    const handleFileContentModal = (file) => {
        if (!file.file_content || !file.file_type) {
            return <p>Error: Incomplete file information</p>;
        }

        setSelectedFileContent(file.file_content); // Store the selected file content for download
        setSelectedFileName(file.file_name); 
        setSelectedFileType(file.file_type);


        // Handle different file types appropriately
        let content;
        if (file.file_type.startsWith('image/')) {
            content = (
                <img
                    src={`data:${file.file_type};base64,${file.file_content}`}
                    alt={file.file_name}
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                />
            );
        } else if (file.file_type === 'application/pdf') {
            content = (
                <iframe
                    src={`data:${file.file_type};base64,${file.file_content}`}
                    title={file.file_name}
                    style={{ width: '100%', height: '500px' }}
                />
            );
        } else if (file.file_type.startsWith('text/')) {
            content = <pre>{atob(file.file_content)}</pre>;
        } else {
            // Handle other file types as needed
            content = <p>Unsupported file type: {file.file_type}</p>;
        }

        return content;
    };

    // const openImageInNewTab = (imageSrc, imageName) => {
    //     // Open the image in a new tab
    //     const newTab = window.open();
    //     newTab.document.write(`
    //         <html>
    //             <body style="margin: 0; display: flex; align-items: center; justify-content: center;">
    //                 <img src="${imageSrc}" alt="${imageName}" style="max-width: 100%;" />
    //             </body>
    //         </html>
    //     `);
    // };

    const handleDownload = () => {
        if (selectedFileContent) {
          /* const file_name = selectedFileContent.file_name;
          const file_content = selectedFileContent.file_content;
          const file_type = selectedFileContent.file_type;

            // Decode the base64-encoded file content
            const decodedContent = atob(file_content);
    
          // Create a Blob from the file content
          const blob = new Blob([decodedContent], { type: file_type });
    
          // Create a download link
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = file_name;
    
          // Append the link to the document and trigger the download
          document.body.appendChild(link);
          link.click();
    
          // Remove the link from the document
          document.body.removeChild(link); */
            const file_name = selectedFileName;
            const file_type = selectedFileType;
            const file_content = selectedFileContent;
            console.log(file_content);

           // Decode the base64-encoded file content
            const decodedContent = atob(file_content);
            // Create a Blob from the decoded content
            const blob = new Blob([decodedContent], { type: file_type });
      
            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = file_name;
      
            // Append the link to the document and trigger the download
            document.body.appendChild(link);
            link.click();
      
            // Remove the link from the document
            document.body.removeChild(link);
        }
    }
    

    return (
        <div className="FileUpload">
            <div className="navbar">
                <ul>

                    <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Dashboard</a></li>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>

                </ul>
            </div>
            <div class="background">
                <div className="title">
                    <h2>My Files</h2>
                </div>


                <form className="upload-items" id="uploadbanner" enctype="multipart/form-data" onSubmit={(e) => e.preventDefault()}>
                    <input id="fileupload" name="myfile" type="file"  onChange={handleFileSelect} />
                    <button type="button" className="menu-item" onClick={handleUpload}>
                        Upload
                    </button>
                </form>

                {/* <div className="menu-item" onClick={() => handleMenuItemClick('All')}>All</div>
                <div className="menu-item" onClick={() => handleMenuItemClick('Shared')}>Shared</div>
                <div className="menu-item" onClick={() => handleMenuItemClick('Favorites')}>Favorites</div> */}
            </div>
            <div className="fileList">
                {/* <h2>File List</h2> */}
                
                {Array.isArray(fileResults) && fileResults && fileResults.length > 0 ? (
                    /*fileResults.map((file, index) => (
                        <li key={index} className="fileItem">
                        {renderPlaceholderImage(file)}
                        <p>{file.file_name}</p>
                        </li>
                    ))
                ) : (
                    <li className="File-Text">No files found</li>
                )}*/
    fileResults.map((file, index) => (
        <li key={index} className="fileItem">
            {renderPlaceholderImage(file)}
            <p>{file.file_name}</p>
        </li>
    ))
) : (
    <li>No files found</li>
)}
                
            </div>
            {isModalOpen && <FileModal content={modalContent} closeModal={closeModal} handleDownload={handleDownload}/>}
        </div>
        

    );


    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split("=");
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    
};

export default FileUpload;
