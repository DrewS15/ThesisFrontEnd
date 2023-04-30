
def preprocess_text(text):
  import re
  import nltk
  from nltk.tokenize import word_tokenize
  from eng_tag_lemmatizer import lemmatize_tagalog_english
  
  with open('stopwords_tl.txt', 'r') as f:
    stopwords_tl = [line.strip() for line in f]

  # Remove unwanted characters and digits
  text = re.sub(r'[^a-zA-Z\s]', '', text)
  
  #Tokenize the text
  tokens = word_tokenize(text)   #current issue word_tokenize is imported in nltk package but not working
  
  # Convert tokens to lowercase
  tokens = [word.lower() for word in tokens]
  # Remove stopwords
  tokens = [word for word in tokens if word.lower() not in stopwords_tl]
  # Lemmatize the tokens

  text = lemmatize_tagalog_english(tokens)

  return text