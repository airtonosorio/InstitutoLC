FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /src
COPY InstitutoLC.Api/InstitutoLC.Api.csproj InstitutoLC.Api/
RUN dotnet restore InstitutoLC.Api/InstitutoLC.Api.csproj
COPY InstitutoLC.Api/ InstitutoLC.Api/
RUN dotnet publish InstitutoLC.Api/InstitutoLC.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=api-build /app/publish .
COPY --from=frontend-build /src/frontend/dist ./Views

EXPOSE 80
ENTRYPOINT ["dotnet", "InstitutoLC.Api.dll"]
