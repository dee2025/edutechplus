-- Create test_results table for storing test series results
CREATE TABLE IF NOT EXISTS test_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exam_name VARCHAR(100),
  topic VARCHAR(255),
  difficulty VARCHAR(20),
  language VARCHAR(10),
  question_count INT,
  correct_answers INT,
  wrong_answers INT,
  score DECIMAL(5, 2),
  user_answers LONGTEXT,
  questions LONGTEXT,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_completed_at (completed_at)
);

-- Create test_statistics table for user statistics
CREATE TABLE IF NOT EXISTS test_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_tests INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  average_score DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
);
