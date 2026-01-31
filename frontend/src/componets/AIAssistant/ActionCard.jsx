import React, { useState } from "react";
import { TaskEditDialog } from "../../Dashboard/TaskEditDialog.jsx";
import ActionDetailCard from "./ActionDetailCard.jsx";

const ActionCard = ({ action, onApprove, onDecline, onEdit }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localActionData, setLocalActionData] = useState(action.data);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const handleEditSave = (updateFields) => {
    setLocalActionData(updateFields);
    setHasBeenEdited(true);
    setIsEditDialogOpen(false);
    // Notify parent of edit so it persists in conversation
    onEdit?.({ ...action, data: updateFields });
  };

  return (
    <>
      <ActionDetailCard
        action={{ ...action, data: localActionData }}
        actionNumber={1}
        onApprove={() => onApprove({ ...action, data: localActionData })}
        onDecline={onDecline}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={localActionData}
        onSave={handleEditSave}
      />
    </>
  );
};

export default ActionCard;
