# Etapa 1: build/publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copia o csproj primeiro (cache de restore fica mais rápido)
COPY InstitutoLC.Api.csproj ./
RUN dotnet restore InstitutoLC.Api.csproj

# agora copia o resto do código
COPY . ./
RUN dotnet publish InstitutoLC.Api.csproj -c Release -o /app/publish

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "InstitutoLC.Api.dll"]
