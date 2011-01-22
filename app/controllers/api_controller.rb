class ApiController < ApplicationController

  def update_nickname
    if params[:user_id] != nil && params[:nickname] != nil
      user = ChatUser.find(params[:user_id])
      old_nickname = user.nickname
      user.nickname = params[:nickname]
      if user.save
        chat = Chat.find(params[:chat_id])
        payload = { :old_nickname => old_nickname, :nickname => user.nickname, :user_id => user.id }
        Pusher["presence-" + chat.channel].trigger('updated_nickname', payload)
        render :text => "SAVED"
      else
        render :text => "ERROR"
      end
    else
      render :text => "ERROR"
    end
  end

  def post_message
    chat = Chat.find(params[:chat_id])
    message = Message.new
    message.chat_id = chat.id
    
    user = ChatUser.user(session)
    message.user_id = user.id
    message.message = params[:message]
    
    payload = message.attributes
    payload[:user] = user.attributes
    
    if message.save
      Pusher["presence-" + chat.channel].trigger('send_message', payload)
      render :text => "sent"
    else
      render :text => "failed"
    end
  end

  def typing_status
    if params[:chat_id] != nil && params[:status] != nil
      chat = Chat.find(params[:chat_id])
      user = ChatUser.user(session)
      
      payload = { :user => user.attributes, :status => params[:status] }
      Pusher["presence-" + chat.channel].trigger('typing_status', payload)
    end
    render :text => ""
  end

  def authenticate
    if params[:user_id]
      user = ChatUser.find(params[:user_id])
      auth = Pusher[params[:channel_name]].authenticate(params[:socket_id],
        :user_id => user.id,
        :chat_user => user.attributes
      )
      render :json => auth
    else
      render :text => "Not authorized", :status => '403'
    end
  end

end
