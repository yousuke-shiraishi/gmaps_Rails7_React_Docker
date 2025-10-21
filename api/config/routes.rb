Rails.application.routes.draw do
  devise_for :users,
  defaults: { format: :json },
  controllers: {
  registrations: 'users/registrations',
  sessions: 'users/sessions'
}
  get "up" => "rails/health#show", as: :rails_health_check
  namespace :api do
    namespace :v1 do
      get 'users/current_user', to: 'users#current'
      resources :users, only: %i[index show update]
      resources :gmaps, only: %i[index create destroy] do
        collection do
          get  :search_public
        end
      end
      get :health, to: "health#show"
      # search_private はmagic_wordを入れるので POST /api/v1/gmaps/search_private にする
      post 'gmaps/search_private', to: 'gmaps#search_private'
    end
  end
end
