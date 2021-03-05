#!/bin/sh

# Generate Private Key
openssl genrsa -out key.private 4096

# Generate Public Key
openssl rsa -in key.private -pubout > key.pem