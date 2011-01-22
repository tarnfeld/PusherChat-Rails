class ChatController < ApplicationController
  
  def new
    chat = Chat.new
    chat.owner = ChatUser.user(session)
    if chat.save
      chat_tiny = Tiny::tiny(chat.id)
        chat.channel = "message_channel_" + chat.id.to_s
        chat.save
      redirect_to :action => "view", :id => chat_tiny
    end
  end

  def view
    
    if(params[:id] != nil)
      @chat = Chat.find(Tiny::untiny(params[:id]))
      @user = ChatUser.user(session)
      @messages = Message.find(:all, :conditions => ["chat_id = ?", @chat.id.to_s])
    else
      redirect_to :controller => 'index', :action => 'index'
    end
    
  end

end
