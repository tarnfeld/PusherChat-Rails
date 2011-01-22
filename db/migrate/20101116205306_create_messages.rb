class CreateMessages < ActiveRecord::Migration
  
  def self.up
    create_table "messages", :force => true do |t|
      t.string   "username"
      t.string   "message"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.integer  "chat_id"
    end
  end

  def self.down
    drop_table :messages
  end
  
end
