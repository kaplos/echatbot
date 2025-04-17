import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useSupabase } from '../SupaBaseProvider';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

// Editable Text Component
const EditableText = ({ elementId, content, currentSlide, currentSlideId, setSlides }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    
    // Update the element with new text
    if (text !== content && currentSlide) {
      const updatedElements = currentSlide.elements.map(el => 
        el.id === elementId ? { ...el, content: text } : el
      );
      
      const updatedSlide = {
        ...currentSlide,
        elements: updatedElements
      };
      
      setSlides(slides => slides.map(s => 
        s.id === currentSlideId ? updatedSlide : s
      ));
    }
  };
  
  const handleChange = (e) => {
    setText(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };
  
  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="bg-transparent border-b border-gray-400 outline-none w-full"
    />
  ) : (
    <div onDoubleClick={handleDoubleClick} className="cursor-text">
      {content}
    </div>
  );
};

// Create a wrapper component that provides the DndProvider
function SlideEditorWrapper({ onSave, initialData ,ideaForm,setIdeaForm,saveSlide }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <SlideEditor onSave={onSave} initialData={initialData} slides={ideaForm} setSlides={setIdeaForm} saveSlide={saveSlide} />
    </DndProvider>
  );
}

// Constants outside component
const ItemTypes = {
  ELEMENT: 'element',
};

// DraggableElement as a separate component outside SlideEditor
function DraggableElement(props) {
  const { id, left, top, type, content, src, onDelete, currentSlide, currentSlideId, setSlides } = props;
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ELEMENT,
    item: { id, left, top, type, content, src },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  const style = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1,
    padding: '8px',
    border: type === 'text' ? '1px dashed gray' : 'none',
    backgroundColor: type === 'text' ? 'rgba(255, 255, 0, 0.7)' : 'transparent',
    minWidth: '50px',
    minHeight: '20px',
    zIndex: type === 'text' ? 20 : 10,
    borderRadius: '4px',
  };

  return (
    <div ref={ref} style={style} className="group">
      {/* Delete button - show on hover */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(id);
        }}
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
        style={{ fontSize: '12px' }}
      >
        ×
      </button>

      {type === 'image' ? (
        <img src={src} alt={content || 'Draggable Image'} style={{ maxWidth: '150px', display: 'block' }} />
      ) : (
        <EditableText 
          elementId={id} 
          content={content} 
          currentSlide={currentSlide}
          currentSlideId={currentSlideId}
          setSlides={setSlides}
        />
      )}
    </div>
  );
}

// Main SlideEditor component
function SlideEditor({ onSave, initialData, saveSlide , slides, setSlides }) {
  
  // const [slides, setSlides] = useState([]);
  const [currentSlideId, setCurrentSlideId] = useState(null);
  const supabase = useSupabase();
  const fileInputRef = useRef(null);
  const slideContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Find current slide
  const currentSlide = slides.find(slide => slide.id === currentSlideId) || null;

  // Initialize slides from initialData only once
  // useEffect(() => {
  //   if (isInitialMount.current && initialData && initialData.slides && initialData.slides.length > 0) {
  //     setSlides(initialData.slides);
  //     setCurrentSlideId(initialData.slides[0].id);
  //     isInitialMount.current = false;
  //   }
  // }, [initialData]);

  // Sync changes with parent component, but only when slides actually change
  // useEffect(() => {
  //   if (!isInitialMount.current && onSave && slides.length > 0) {
  //     onSave({ slides });
  //   }
  // }, [slides, onSave]);

  // Element Movement Function
  const moveElement = useCallback((id, left, top) => {
    if (!currentSlide) return;

    // Calculate bounds
    let clampedLeft = left;
    let clampedTop = top;
    if (slideContainerRef.current) {
      const bounds = slideContainerRef.current.getBoundingClientRect();
      clampedLeft = Math.max(0, Math.min(left, bounds.width - 50));
      clampedTop = Math.max(0, Math.min(top, bounds.height - 50));
    }

    // Update element position
    const updatedElements = (currentSlide.elements || []).map(element =>
      element.id === id ? { ...element, left: clampedLeft, top: clampedTop } : element
    );

    const updatedSlide = { ...currentSlide, elements: updatedElements };

    // Update state
    setSlides(slides.map(slide =>
      slide.id === currentSlideId ? updatedSlide : slide
    ));
  }, [currentSlide, currentSlideId, slides]);

  // Drop target handler
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const containerRect = slideContainerRef.current?.getBoundingClientRect();

      if (!offset || !containerRect) return;

      const newLeft = Math.round(offset.x - containerRect.left);
      const newTop = Math.round(offset.y - containerRect.top);

      moveElement(item.id, newLeft, newTop);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Ref combining function
  const setDropTargetRef = useCallback(node => {
    slideContainerRef.current = node;
    drop(node);
  }, [drop]);

  // Add a new slide
  const addSlide = async (e) => {
    e.preventDefault();
    
    const newSlide = { 
      id: uuidv4(), 
      elements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setSlides([...slides, newSlide]);
    setCurrentSlideId(newSlide.id);
  };

  // Remove a slide
  const removeSlide = async (e, id) => {
    e.preventDefault();
    
    const remainingSlides = slides.filter(slide => slide.id !== id);
    setSlides(remainingSlides);
    
    if (currentSlideId === id) {
      setCurrentSlideId(remainingSlides.length > 0 ? remainingSlides[0].id : null);
    }
  };

  // Add text element to slide
  const addTextElement = (e) => {
    e.preventDefault();

    if (!currentSlide) return;
    
    const newElement = {
      id: uuidv4(),
      type: 'text',
      content: 'New Text',
      left: 50,
      top: 50,
    };
    
    const updatedSlide = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement]
    };
    
    setSlides(slides.map(s => 
      s.id === currentSlideId ? updatedSlide : s
    ));
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    if (!currentSlide || !event.target.files || event.target.files.length === 0 || !supabase) return;
    
    try {
      const files = Array.from(event.target.files);
      const uploadedElements = [];

      for (const file of files) {
        const fileName = `${uuidv4()}-${file.name}`;
        const filePath = `idea-images/${fileName}`;
    
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('echatbot')
          .upload(filePath, file);
    
        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          continue;
        }
    
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('echatbot')
          .getPublicUrl(filePath);
    
        if (!publicUrl) {
          console.error(`Error getting URL for ${file.name}`);
          continue;
        }
    
        // Create draggable image element
        uploadedElements.push({
          id: uuidv4(),
          type: 'image',
          src: publicUrl,
          content: file.name,
          left: 100,
          top: 100,
        });
      }

      // Update current slide with new elements
      const updatedSlide = {
        ...currentSlide,
        elements: [...(currentSlide.elements || []), ...uploadedElements]
      };

      // Update slides state
      setSlides(slides.map(s => 
        s.id === currentSlideId ? updatedSlide : s
      ));

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Trigger file input click
  const triggerImageUpload = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add function to delete an element
  const deleteElement = (elementId) => {
    if (!currentSlide) return;
    
    // Filter out the element to be deleted
    const updatedElements = (currentSlide.elements || []).filter(
      element => element.id !== elementId
    );
    
    const updatedSlide = {
      ...currentSlide,
      elements: updatedElements
    };
    
    // Update state
    setSlides(slides.map(s => 
      s.id === currentSlideId ? updatedSlide : s
    ));
  };

  // Update DraggableElement to support editable text
  function DraggableElementWithEdit(props) {
    const { id, left, top, type, content, src, onDelete } = props;
    const ref = useRef(null);
  
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.ELEMENT,
      item: { id, left, top, type, content, src },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
  
    drag(ref);
  
    // Give text elements a higher z-index than images
    const zIndexValue = type === 'text' ? 20 : 10;
  
    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      cursor: 'move',
      opacity: isDragging ? 0.5 : 1,
      padding: '8px',
      border: type === 'text' ? '1px dashed gray' : 'none',
      backgroundColor: type === 'text' ? 'rgba(255, 255, 0, 0.7)' : 'transparent',
      minWidth: '50px',
      minHeight: '20px',
      zIndex: zIndexValue,
      borderRadius: '4px',
    };
  
    return (
      <div ref={ref} style={style} className="group">
        {/* Delete button - show on hover */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent drag from being triggered
            onDelete(id);
          }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
          style={{ fontSize: '12px' }}
        >
          ×
        </button>
  
        {type === 'image' ? (
          <img src={src} alt={content || 'Draggable Image'} style={{ maxWidth: '150px', display: 'block' }} />
        ) : (
          <EditableText elementId={id} content={content} />
        )}
      </div>
    );
  }

  // Export current design as a JSON object
  const exportDesign = (e) => {
    e.preventDefault();
    if (slides.length === 0) {
      console.error("No slides to export");
      return;
    }
    
    const designData = {
      slides: slides,
      exportedAt: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(designData);
    }
  };

  return (
    <div className="slideshow-editor p-4 flex flex-col h-screen max-h-full">
      {/* Controls */}
      <div className="controls mb-4 flex items-center space-x-2 flex-wrap">
        <h2 className="text-xl font-semibold mr-4 w-full sm:w-auto mb-2 sm:mb-0">Slide Editor</h2>
        <button onClick={addSlide} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mb-2 sm:mb-0">Add Slide</button>
        
        {slides.length > 0 && currentSlide && (
          <>
            <button 
              onClick={(e) => removeSlide(e,currentSlide.id)} 
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mb-2 sm:mb-0" 
              disabled={slides.length <= 1}
            >
              Remove Current Slide
            </button>
            <button onClick={addTextElement} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mb-2 sm:mb-0">
              Add Text
            </button>
            <button onClick={triggerImageUpload} className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 mb-2 sm:mb-0">
              Add Image
            </button>
            
            <input
              type="file"
              multiple={true}
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <select
              value={currentSlideId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (slides.some(s => s.id === selectedId)) {
                  setCurrentSlideId(selectedId);
                }
              }}
              className="p-1 border rounded mb-2 sm:mb-0"
            >
              {slides.map((slide, index) => (
                <option key={slide.id} value={slide.id}>
                  Slide {index + 1}
                </option>
              ))}
            </select>
            
            <button 
              onClick={exportDesign} 
              className="ml-auto bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 mb-2 sm:mb-0"
            >
              Save Design
            </button>
          </>
        )}
        
        {slides.length === 0 && (
          <p className="w-full text-center sm:w-auto sm:text-left mb-2 sm:mb-0">
            No slides yet. Add one to start!
          </p>
        )}
      </div>

      {/* Slide Canvas */}
      <div className="slides-container flex-grow border border-gray-300 rounded bg-gray-50 overflow-auto">
        {currentSlide ? (
          <div
            ref={setDropTargetRef}
            className="slide-content w-full h-full relative"
            style={{ 
              minHeight: '600px', 
              minWidth: '800px',
              backgroundColor: 'transparent',
            }}
          >
            {(currentSlide.elements || []).map((element) => (
              <DraggableElement
                key={element.id}
                id={element.id}
                left={element.left}
                top={element.top}
                type={element.type}
                content={element.content}
                src={element.src}
                onDelete={deleteElement}
                currentSlide={currentSlide}
                currentSlideId={currentSlideId}
                setSlides={setSlides}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {slides.length > 0 ? "Select or add a slide" : "Add a slide to begin"}
          </div>
        )}
      </div>
    </div>
  );
}

// Export the wrapped version with DndProvider
export default SlideEditorWrapper;
