class ApplicationController < ActionController::Base

  before_filter { response.headers['P3P'] = %q|CP="HONK"| }

end
