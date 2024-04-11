import "./FileModal.css"
const FileModal = ({ content, closeModal, handleDownload}) => {

  return (
    <div className="file-modal">
      <div className="modal-content">{content}
        <div className="button-container">
          <button className="button" onClick={closeModal}>Close</button>
          <button className="button" onClick={handleDownload}>Download</button>
          <button className="button">Delete</button>
          </div>
        </div>
      </div>
  );
};
  
export default FileModal;