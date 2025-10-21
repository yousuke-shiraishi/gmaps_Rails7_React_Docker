# Allow docker service names in development
if Rails.env.development?
  Rails.application.config.hosts += %w[api nginx]
end
