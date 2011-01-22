class ChatUser < ActiveRecord::Base
  
  def self.user(session)
    
    if session[:user_id] == nil
      user = self.new
      user.nickname = "user_" + Time.now.to_i.to_s
      if user.save
        session[:user_id] = user.id
      end
    else
      user = self.find(session[:user_id])
    end

    # Return the user
    user
    
  end
  
end
