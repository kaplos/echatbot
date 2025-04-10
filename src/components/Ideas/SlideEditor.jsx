import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useSupabase } from '../SupaBaseProvider';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

// Create a wrapper component that provides the DndProvider
function SlideEditorWrapper({ onSave, initialData, onSlideChange, onExport }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <SlideEditor 
        onSave={onSave} 
        initialData={initialData} 
        onSlideChange={onSlideChange}
        onExport={onExport}
      />
    </DndProvider>
  );
}

// Constants outside component
const ItemTypes = {
  ELEMENT: 'element',
};

// DraggableElement as a separate component outside SlideEditor
function DraggableElement(props) {
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
    transform: isDragging ? 'scale(1.05)' : 'none',
    transition: 'transform 0.2s ease',
  };

  return (
    <div ref={ref} style={style} className="group">
      {/* Delete button - show on hover */}
      <button 
        onClick={(e) => {
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
        <div>{content}</div>
      )}
    </div>
  );
}

// Main SlideEditor component
function SlideEditor({ onSave, initialData, onSlideChange, onExport }) {
  const [slides, setSlides] = useState([]);
  const [currentSlideId, setCurrentSlideId] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabase();
  const fileInputRef = useRef(null);
  const slideContainerRef = useRef(null);

  // Find current slide
  const currentSlide = slides.find(slide => slide.id === currentSlideId);

  // Notify parent of slide changes
  useEffect(() => {
    if (onSlideChange && currentSlide) {
      // Only notify parent if there are actual changes
      const currentSlides = slides.map(slide => ({
        ...slide,
        elements: slide.elements || []
      }));
      
      // Use a ref to track if we've already notified about these changes
      const currentSlideId = currentSlide.id;
      const currentElements = JSON.stringify(currentSlide.elements);
      
      if (currentSlideId !== lastNotifiedSlideId.current || 
          currentElements !== lastNotifiedElements.current) {
        onSlideChange(currentSlide, currentSlides);
        lastNotifiedSlideId.current = currentSlideId;
        lastNotifiedElements.current = currentElements;
      }
    }
  }, [currentSlide, slides, onSlideChange]);

  // Add refs to track last notified state
  const lastNotifiedSlideId = useRef(null);
  const lastNotifiedElements = useRef(null);

  // Reset notification tracking when initialData changes
  useEffect(() => {
    lastNotifiedSlideId.current = null;
    lastNotifiedElements.current = null;
  }, [initialData]);

  // If initialData is provided, use it to initialize our slides
  useEffect(() => {
    if (initialData && initialData.slides && initialData.slides.length > 0) {
      setSlides(initialData.slides.map(slide => ({
        ...slide,
        elements: slide.elements || []
      })));
      setCurrentSlideId(initialData.slides[0].id);
    } else {
      // Create a default slide if no initial data is provided
      const newSlide = {
        id: uuidv4(),
        elements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSlides([newSlide]);
      setCurrentSlideId(newSlide.id);
    }
  }, [initialData]);

  // Set first slide as current when loaded if not already set
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlideId(slides[0].id);
    }
  }, [slides, currentSlideId]);

  // Setup drag and drop for file dropping
  const setupNativeFileDrop = () => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only show drop zone if we're dragging files
      if (e.dataTransfer.types.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only show drop zone if we're dragging files
      if (e.dataTransfer.types.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (!currentSlide) return;
      
      // Get the files from the drop event
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (files.length === 0) return;

      // Calculate drop position relative to the slide container
      const containerRect = slideContainerRef.current.getBoundingClientRect();
      const dropX = e.clientX - containerRect.left;
      const dropY = e.clientY - containerRect.top;
      
      // Process and upload files
      await processFiles(files, dropX, dropY);
    };

    // Add event listeners to the slide container
    const container = slideContainerRef.current;
    if (container) {
      container.addEventListener('dragover', handleDragOver);
      container.addEventListener('dragenter', handleDragEnter);
      container.addEventListener('dragleave', handleDragLeave);
      container.addEventListener('drop', handleDrop);

      // Clean up event listeners
      return () => {
        container.removeEventListener('dragover', handleDragOver);
        container.removeEventListener('dragenter', handleDragEnter);
        container.removeEventListener('dragleave', handleDragLeave);
        container.removeEventListener('drop', handleDrop);
      };
    }
  };

  // Add event listeners for file drag and drop
  useEffect(() => {
    if (slideContainerRef.current) {
      const cleanup = setupNativeFileDrop();
      return cleanup;
    }
  }, [currentSlide, slideContainerRef.current]);

  // Process multiple files for upload
  const processFiles = async (files, initialLeft = 100, initialTop = 100) => {
    if (!currentSlide || !files.length) return;
    
    try {
      const newElements = [];
      const spacing = 20; // Spacing between dropped images
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${uuidv4()}-${file.name}`;
        const filePath = `idea-images/${fileName}`;

        // Calculate position for multiple images
        const left = initialLeft + (i * spacing);
        const top = initialTop + (i * spacing);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('echatbot')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError.message);
          continue;
        }

        // Get public URL
        const { data: urlData, error: urlError } = supabase.storage
          .from('echatbot')
          .getPublicUrl(filePath);

        if (urlError || !urlData?.publicUrl) {
          console.error(`Could not get public URL for ${file.name}`, urlError?.message);
          continue;
        }

        // Add to new elements list
        newElements.push({
          id: uuidv4(),
          type: 'image',
          src: urlData.publicUrl,
          content: file.name,
          left,
          top,
        });
      }

      if (newElements.length > 0) {
        // Update current slide with all new image elements
        const updatedSlide = {
          ...currentSlide,
          elements: [...(currentSlide.elements || []), ...newElements],
        };

        // Update slides state
        setSlides(prevSlides => 
          prevSlides.map(s => s.id === currentSlideId ? updatedSlide : s)
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing files:', error.message);
      return false;
    }
  };

  // Update handleImageUpload to use processFiles
  const handleImageUpload = async (event) => {
    if (!currentSlide || !event.target.files || event.target.files.length === 0 || !supabase) return;
    
    const files = Array.from(event.target.files);
    await processFiles(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export current design as a JSON object
  const exportDesign = () => {
    if (slides.length === 0) {
      console.error("No slides to export");
      return;
    }
    
    const designData = {
      slides: slides,
      exportedAt: new Date().toISOString()
    };
    
    // Call onExport if provided - this will be used by AddIdeaModal
    if (onExport) {
      onExport(designData);
      return; // Early return after sending to parent component
    }
    
    // If we're in modal context and onSave is provided, use it
    if (onSave) {
      onSave(designData);
    } else {
      // Otherwise offer a download of the JSON
      const dataStr = JSON.stringify(designData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `slide-design-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  // Drop target handler
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const containerRect = slideContainerRef.current?.getBoundingClientRect();

      if (!offset || !containerRect) return;

      // Calculate the new position relative to the container
      const newLeft = Math.round(offset.x - containerRect.left);
      const newTop = Math.round(offset.y - containerRect.top);

      // Update the element's position
      moveElement(item.id, newLeft, newTop);
      return undefined;
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Element Movement Function
  const moveElement = useCallback((id, left, top) => {
    if (!currentSlide) return;

    // Update element position
    const updatedElements = (currentSlide.elements || []).map(element =>
      element.id === id ? { ...element, left, top } : element
    );

    const updatedSlide = { ...currentSlide, elements: updatedElements };

    // Update state
    setSlides(prevSlides => 
      prevSlides.map(slide => slide.id === currentSlideId ? updatedSlide : slide)
    );
  }, [currentSlide, currentSlideId]);

  // Ref combining function
  const setDropTargetRef = useCallback(node => {
    slideContainerRef.current = node;
    drop(node);
  }, [drop]);

  // Add a new slide
  const addSlide = () => {
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
  const removeSlide = (id) => {
    const remainingSlides = slides.filter(slide => slide.id !== id);
    setSlides(remainingSlides);
    
    if (currentSlideId === id) {
      setCurrentSlideId(remainingSlides.length > 0 ? remainingSlides[0].id : null);
    }
  };

  // Add text element to slide
  const addTextElement = () => {
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
    
    setSlides(slides.map(s => s.id === currentSlideId ? updatedSlide : s));
  };

  // Trigger file input click
  const triggerImageUpload = () => {
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
    
    // Update state only
    setSlides(slides.map(s => s.id === currentSlideId ? updatedSlide : s));
  };

  // Editable Text Component
  const EditableText = ({ elementId, content }) => {
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
        
        setSlides(slides.map(s => 
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

  return (
    <div className="slideshow-editor p-4 flex flex-col h-screen max-h-full">
      {/* Controls */}
      <div className="controls mb-4 flex items-center space-x-2 flex-wrap">
        <h2 className="text-xl font-semibold mr-4 w-full sm:w-auto mb-2 sm:mb-0">Slide Editor</h2>
        <button onClick={addSlide} className="bg-chabot-gold text-white px-3 py-1 rounded hover:bg-opacity-90 mb-2 sm:mb-0">Add Slide</button>
        
        {slides.length > 0 && currentSlide && (
          <>
            <button 
              onClick={() => removeSlide(currentSlide.id)} 
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mb-2 sm:mb-0" 
              disabled={slides.length <= 1}
            >
              Remove Current Slide
            </button>
            <button onClick={addTextElement} className="bg-chabot-gold text-white px-3 py-1 rounded hover:bg-opacity-90 mb-2 sm:mb-0">
              Add Text
            </button>
            <button onClick={triggerImageUpload} className="bg-chabot-gold text-white px-3 py-1 rounded hover:bg-opacity-90 mb-2 sm:mb-0">
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
                setCurrentSlideId(e.target.value);
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
              className="ml-auto bg-chabot-gold text-white px-3 py-1 rounded hover:bg-opacity-90 mb-2 sm:mb-0"
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
              backgroundColor: isDraggingOver 
                ? 'rgba(79, 70, 229, 0.1)' 
                : (isOver ? 'rgba(0, 0, 255, 0.05)' : 'transparent'),
              transition: 'background-color 0.2s ease',
            }}
          >
            {/* Dropzone indicator */}
            {isDraggingOver && (
              <div className="absolute inset-0 border-2 border-dashed border-indigo-400 flex items-center justify-center pointer-events-none z-0">
                <div className="bg-white bg-opacity-80 px-4 py-2 rounded-lg shadow text-indigo-700 font-medium">
                  Drop images here
                </div>
              </div>
            )}
          
            {(currentSlide.elements || []).map((element) => (
              <DraggableElementWithEdit
                key={element.id}
                id={element.id}
                left={element.left}
                top={element.top}
                type={element.type}
                content={element.content}
                src={element.src}
                onDelete={deleteElement}
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
