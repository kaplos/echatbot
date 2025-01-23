import IdeaCard from './IdeaCard'

const IdeaBoard = ( {ideas,handleClick} ) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} handleClick={handleClick}/>
        ))}
      </div>
    );
  };

  export default IdeaBoard;