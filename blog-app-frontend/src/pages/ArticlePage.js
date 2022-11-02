import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useUser from '../hooks/useUser';

import axios from 'axios';

import articles from './article-content';
import NotFoundPage from './NotFoundPage';

import CommentsList from '../components/CommentsList';
import { AddCommentForm } from '../components/AddCommentForm';

const ArticlePage = () => {
    const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false });
    const { canUpvote } = articleInfo;
    const { articleId } = useParams();
    const article = articles.find(article => article.name === articleId);
    const navigate = useNavigate();

    const { user, isLoading } = useUser();

    useEffect(() => {
        const loadArticleInfo = async () => {
            const token = user && await user.getIdToken();
            const headers = token ? { authtoken: token } : {};
            const response = await axios.get(`http://localhost:8080/api/articles/${articleId}`, { headers });
            const articleInfo = response.data;
            setArticleInfo(articleInfo);
        }
        if (!isLoading) {
            loadArticleInfo();
        }
    }, [isLoading, user]);

    const addUpvote = async () => {
        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};
        const response = await axios.put(`http://localhost:8080/api/articles/${articleId}/upvote`, null, { headers });
        const updatedArticle = response.data
        setArticleInfo(updatedArticle);
    }

    if (!article) return <NotFoundPage />
    return (
        <>
            <h1>{article.title}</h1>
            <div className="upvotes-section">
                {user
                    ? <button onClick={addUpvote}>{canUpvote ? 'Upvote' : 'Already Upvoted'}</button>
                    : <button onClick={() => {
                        navigate("/login");
                    }}>Log in to upvote</button>
                }
                <p>This article has {articleInfo.upvotes} upvote(s)</p>
            </div>

            {article.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}
            {user
                ? <AddCommentForm
                    articleName={articleId}
                    onArticleUpdated={(updatedArticle) => setArticleInfo(updatedArticle)}
                />
                : <button onClick={() => {
                    navigate("/login");
                }}>Log in to add a comment</button>
            }
            <CommentsList comments={articleInfo.comments} />
        </>
    );
}

export default ArticlePage;