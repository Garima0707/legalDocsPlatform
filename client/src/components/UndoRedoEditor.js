import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import axios from 'axios';
import 'draft-js/dist/Draft.css';

const UndoRedoEditor = ({ documentId }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch the document content from the backend on load
    const fetchDocument = async () => {
      try {
        const { data } = await axios.get(`/api/get-document/${documentId}`);
        if (data.content) {
          const contentState = convertFromRaw(JSON.parse(data.content));
          setEditorState(EditorState.createWithContent(contentState));
        }
      } catch (error) {
        console.error('Failed to fetch document:', error.message);
      }
    };
    fetchDocument();
  }, [documentId]);

  const handleAutosave = async () => {
    try {
      setIsSaving(true);
      const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      await axios.post('/api/save-document', { documentId, content });
      setIsSaving(false);
    } catch (error) {
      console.error('Autosave failed:', error.message);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(handleAutosave, 5000); // Autosave every 5 seconds
    return () => clearTimeout(debounce);
  }, [editorState]);

  return (
    <div>
      <div>
        <button onClick={() => setEditorState(EditorState.undo(editorState))}>Undo</button>
        <button onClick={() => setEditorState(EditorState.redo(editorState))}>Redo</button>
      </div>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        placeholder="Type something..."
      />
      {isSaving && <p>Saving...</p>}
    </div>
  );
};

export default UndoRedoEditor;
