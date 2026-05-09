import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface Post {
  id: string;
  author: string;
  authorPhoto?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: Date;
}

export default function PublicSpace() {
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);
  
  // Friend Simulator State
  const [friendCount, setFriendCount] = useState<number>(0);
  
  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  
  // Posting limit tracking
  const [postsTodayCount, setPostsTodayCount] = useState<number>(0);

  // Comment state
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedFriends = localStorage.getItem('friendCount');
    if (savedFriends) setFriendCount(parseInt(savedFriends, 10));

    const savedPostsCount = localStorage.getItem('postsTodayCount');
    if (savedPostsCount) setPostsTodayCount(parseInt(savedPostsCount, 10));

    const savedPosts = localStorage.getItem('publicPosts');
    if (savedPosts) {
      // Parse dates properly
      const parsed = JSON.parse(savedPosts).map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
        comments: p.comments.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }))
      }));
      setPosts(parsed);
    } else {
      // Dummy data
      setPosts([
        {
          id: '1',
          author: 'John Doe',
          authorPhoto: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
          content: 'Just finished my first week at my new internship! Loving it so far.',
          likes: 5,
          comments: [],
          shares: 0,
          timestamp: new Date(Date.now() - 3600000)
        }
      ]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('friendCount', friendCount.toString());
  }, [friendCount]);

  useEffect(() => {
    localStorage.setItem('postsTodayCount', postsTodayCount.toString());
  }, [postsTodayCount]);

  useEffect(() => {
    localStorage.setItem('publicPosts', JSON.stringify(posts));
  }, [posts]);

  // Handle media selection (mock upload using local object URLs)
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setSelectedMedia({ url, type });
    }
  };

  // Determine posting limit
  const getRemainingPosts = () => {
    if (friendCount === 0) return 0;
    if (friendCount > 10) return Infinity;
    return friendCount - postsTodayCount;
  };

  const remaining = getRemainingPosts();
  const canPost = remaining > 0 || remaining === Infinity;

  const handlePost = () => {
    if (!isLoggedIn) {
      toast.error('Please login to post!');
      return;
    }
    if (!postContent.trim() && !selectedMedia) {
      toast.error('Post cannot be empty!');
      return;
    }
    if (!canPost) {
      toast.error('Posting limit reached. Add more friends to post more!');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: userInfo.name,
      authorPhoto: userInfo.photo || `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`,
      content: postContent,
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
      likes: 0,
      comments: [],
      shares: 0,
      timestamp: new Date()
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setSelectedMedia(null);
    setPostsTodayCount(prev => prev + 1);
    toast.success('Post created successfully!');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleShare = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
    toast.success('Post shared successfully!');
  };

  const handleComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    if (!isLoggedIn) {
      toast.error('Please login to comment!');
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: userInfo.name,
      text: text,
      timestamp: new Date()
    };

    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar />
      
      <main className="max-w-4xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Left Column - Friend Simulator */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Friend Simulator</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Adjust your friend count to see how posting limits work.
            </p>
            
            <div className="flex items-center justify-between mb-6 bg-blue-50 p-4 rounded-lg">
              <button 
                onClick={() => setFriendCount(Math.max(0, friendCount - 1))}
                className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold text-xl shadow hover:bg-blue-100 transition"
              >-</button>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-700">{friendCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mt-1">Friends</div>
              </div>
              <button 
                onClick={() => setFriendCount(friendCount + 1)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xl shadow hover:bg-blue-700 transition"
              >+</button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
              <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">Your Limits Today</h4>
              <div className="flex justify-between">
                <span>Posts Made:</span>
                <span className="font-bold">{postsTodayCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Posts Allowed:</span>
                <span className="font-bold">{friendCount > 10 ? 'Unlimited' : friendCount}</span>
              </div>
              <div className="flex justify-between text-blue-600 font-medium pt-2 border-t mt-2">
                <span>Remaining:</span>
                <span>{remaining === Infinity ? 'Unlimited' : remaining}</span>
              </div>
            </div>

            <button 
              onClick={() => setPostsTodayCount(0)}
              className="mt-6 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition"
            >
              Reset Today's Posts
            </button>
          </div>
        </div>

        {/* Right Column - Feed */}
        <div className="w-full md:w-2/3">
          
          {/* Create Post Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Public Space
            </h2>
            
            {friendCount === 0 ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                You have no friends. Make some connections to start posting!
              </div>
            ) : !canPost ? (
              <div className="p-4 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 font-medium">
                You have reached your posting limit for today. Make more friends to increase your limit!
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition bg-gray-50 hover:bg-white"
                  rows={3}
                  placeholder={isLoggedIn ? `What's on your mind, ${userInfo.name.split(' ')[0]}?` : "Login to share something..."}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  disabled={!isLoggedIn}
                ></textarea>
                
                {selectedMedia && (
                  <div className="relative inline-block w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => setSelectedMedia(null)}
                      className="absolute top-2 right-2 bg-gray-900 bg-opacity-60 text-white rounded-full p-1.5 hover:bg-opacity-80 transition z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    {selectedMedia.type === 'image' ? (
                      <img src={selectedMedia.url} alt="Selected" className="max-h-64 w-full object-contain" />
                    ) : (
                      <video src={selectedMedia.url} controls className="max-h-64 w-full" />
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleMediaSelect}
                      disabled={!isLoggedIn}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition font-medium text-sm disabled:opacity-50"
                      disabled={!isLoggedIn}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Photo/Video
                    </button>
                  </div>
                  <button 
                    onClick={handlePost}
                    disabled={!isLoggedIn || (!postContent.trim() && !selectedMedia)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <img src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.author}&background=random`} alt={post.author} className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <div className="font-bold text-gray-900">{post.author}</div>
                    <div className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                
                {/* Post Content */}
                {post.content && (
                  <div className="px-4 pb-3 text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </div>
                )}
                
                {/* Post Media */}
                {post.mediaUrl && (
                  <div className="w-full bg-gray-50 border-y border-gray-100">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt="Post media" className="w-full max-h-[500px] object-contain" />
                    ) : (
                      <video src={post.mediaUrl} controls className="w-full max-h-[500px]" />
                    )}
                  </div>
                )}
                
                {/* Post Stats */}
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>{post.likes} Likes</span>
                  <span>{post.comments.length} Comments • {post.shares} Shares</span>
                </div>
                
                {/* Post Actions */}
                <div className="px-2 py-1 flex justify-between border-b border-gray-100">
                  <button onClick={() => handleLike(post.id)} className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                    Like
                  </button>
                  <button onClick={() => document.getElementById(`comment-input-${post.id}`)?.focus()} className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Comment
                  </button>
                  <button onClick={() => handleShare(post.id)} className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Share
                  </button>
                </div>
                
                {/* Comments Section */}
                <div className="p-4 bg-gray-50">
                  {post.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <img src={`https://ui-avatars.com/api/?name=${comment.author}&background=random`} alt={comment.author} className="w-8 h-8 rounded-full border border-gray-200" />
                          <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex-1">
                            <div className="font-bold text-xs text-gray-900">{comment.author}</div>
                            <div className="text-sm text-gray-800 mt-1">{comment.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  <div className="flex gap-2 items-center">
                    <img src={userInfo?.photo || `https://ui-avatars.com/api/?name=User&background=random`} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div className="flex-1 flex border border-gray-200 rounded-full bg-white overflow-hidden shadow-inner">
                      <input 
                        id={`comment-input-${post.id}`}
                        type="text" 
                        placeholder="Write a comment..." 
                        className="flex-1 px-4 py-2 outline-none text-sm"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button 
                        onClick={() => handleComment(post.id)}
                        className="px-4 text-blue-600 font-medium hover:bg-blue-50 transition text-sm"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                No posts yet. Be the first to share something!
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
