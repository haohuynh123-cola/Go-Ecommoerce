# syntax=docker/dockerfile:1

FROM golang:1.26-alpine as server

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o server ./cmd/server

FROM scratch

COPY --from=server /app/server /server

EXPOSE 8080

CMD ["./server"]