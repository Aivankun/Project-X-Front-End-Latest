import React from "react";
import { Modal } from "react-bootstrap";

const TRANSLATIONS = {
  English: {
    confirmMessage: 'Are you sure you want to permanently delete',
    singleItem: 'this reference request',
    allItems: 'all these reference requests',
    selectedItems: 'these selected reference requests',
    warning: 'This action cannot be undone',
    yes: 'Yes',
    no: 'No'
  },
  Japanese: {
    confirmMessage: '完全に削除してもよろしいですか',
    singleItem: 'このリファレンスリクエスト',
    allItems: 'これらすべてのリファレンスリクエスト',
    selectedItems: '選択されたリファレンスリクエスト',
    warning: 'この操作は取り消せません',
    yes: 'はい',
    no: 'いいえ'
  }
};

const DeleteConfirmationReferenceRequestPopUp = ({
  onClose,
  onConfirmDelete,
  selectedCount,

  isAll,
  isSingleItem,
  isDeletingReferenceRequest,
}) => {
  const language = sessionStorage.getItem("preferred-language") || "English";

  return (
    <Modal
      show={true}
      onHide={onClose}
      className="custom-modal-edit-user"
      centered
      backdrop={true}
    >
      <Modal.Body>
        <div className="d-flex justify-content-center align-items-center flex-column p-2 py-3">
          <p className="text-center m-0">
            {TRANSLATIONS[language].confirmMessage}{" "} 
            {isSingleItem || selectedCount === 1
              ? TRANSLATIONS[language].singleItem
              : isAll
              ? TRANSLATIONS[language].allItems
              : TRANSLATIONS[language].selectedItems}
            ? {TRANSLATIONS[language].warning}{" "}
          </p>

          <div className="d-flex justify-content-center gap-3 w-100 mt-4">
            <button
              className="btn-yes-delete"
              onClick={onConfirmDelete}
              disabled={isDeletingReferenceRequest}
            >
              {isDeletingReferenceRequest ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                ></div>
              ) : (
                TRANSLATIONS[language].yes
              )}
            </button>
            <button className="btn-no-delete" onClick={onClose}>
              {TRANSLATIONS[language].no}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmationReferenceRequestPopUp;
