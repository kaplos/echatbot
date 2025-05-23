import { useEffect } from 'react';

export default function SlideRenderer({ slide, onRenderComplete }) {
  

  

//   return (
//     <div
//       className="relative w-[800px] h-[1000px] bg-white"
//       style={{ pageBreakAfter: 'always' }}
//     >
//       {elements.map((el) => {
//         if (el.type === 'image') {
//             console.log(el, 'el in slide renderer')
//           return (
//             <img
//               key={el.id}
//               src={el.src}
//               alt={el.content || 'image'}
//               style={{
//                 position: 'absolute',
//                 top: el.top,
//                 left: el.left,
//                 maxWidth: '200px',
//               }}
//             />
//           );
//         }

//         if (el.type === 'text') {
//           return (
//             <div
//               key={el.id}
//               style={{
//                 position: 'absolute',
//                 top: el.top,
//                 left: el.left,
//                 backgroundColor: 'white',
//                 padding: '4px',
//                 border: '1px solid #ccc',
//               }}
//             >
//               {el.content}
//             </div>
//           );
//         }

//         return null;
//       })}
//     </div>
//   );
return (
    <div
      className="relative bg-white "
      style={{
        width: '8in',     // full page width
        height: '11in',   // full page height
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: '1px solid #ccc',  // optional: visualize the page boundary
      }}
    >
      {slide.elements.map((element) => (
        <div key={element.id}>
          {element.type === 'image' && (
            <img
              src={element.src}
              alt={element.content || 'image'}
              style={{
                position: 'absolute',
                top: element.top,
                left: element.left,
                maxWidth: '200px',
              }}
            />
          )}
          {element.type === 'text' && (
            <div
              style={{
                position: 'absolute',
                top: element.top,
                left: element.left,
                padding: '8px 12px',
                backgroundColor: 'yellow',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                maxWidth: '300px',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {element.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
