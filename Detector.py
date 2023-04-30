def detection(userSentiment): 
  from sklearn.feature_extraction.text import TfidfVectorizer
  import joblib
  from txtpreprocess import preprocess_text

  # Load the trained SVM model
  clf = joblib.load('svm_model_sigmoid.joblib')
  
  # Load the vectorizer fitted on the training data
  vectorizer = joblib.load('tfidf_vectorizer_sigmoid.joblib')
  
  # Get input from user
  sentiment = str(userSentiment)
  
  # Preprocess the input text
  sentiment_processed = preprocess_text(sentiment)

  # Vectorize the input text
  sentiment_vectorized = vectorizer.transform([sentiment_processed])
  # Predict the sentiment using the trained SVM model
  prediction = clf.predict(sentiment_vectorized)

  # Print the prediction
  if prediction == 1:
      print("Negative Statement")
  else:
      print("Positive sentiment")
