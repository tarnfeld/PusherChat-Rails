class IndexController < ApplicationController
  
  def index
    # Get the chat user by passing in the current cookie session
    @user = ChatUser.user(session)
  end

end
