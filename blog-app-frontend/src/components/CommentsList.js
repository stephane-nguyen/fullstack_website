/**
 * Display all our comments
 */

const CommentsList = ({ comments }) => (
    <>
        <h3>Comments:</h3>
        {comments.map(comment => (
            <div className="comment" key={comment.postedBy + ': ' + comment.text}>
                <h4>{comment.postedBy}</h4>
                <h4>{comment.text}</h4>
            </div>
        ))}
    </>
);

export default CommentsList;