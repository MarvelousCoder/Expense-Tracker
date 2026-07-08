# tests/test_auth.py
#
# Tests for password hashing and verification —
# the foundation of the entire auth system.

from app.core.security import hash_password, verify_password


def test_hash_password_produces_different_hash_each_time():
    """bcrypt includes a random salt — hashing the same password twice
    should produce two different hashes."""
    hash1 = hash_password("MySecurePass123")
    hash2 = hash_password("MySecurePass123")
    assert hash1 != hash2


def test_verify_correct_password_succeeds():
    plain = "MySecurePass123"
    hashed = hash_password(plain)
    assert verify_password(plain, hashed) is True


def test_verify_incorrect_password_fails():
    hashed = hash_password("MySecurePass123")
    assert verify_password("WrongPassword456", hashed) is False


def test_verify_empty_password_fails():
    hashed = hash_password("MySecurePass123")
    assert verify_password("", hashed) is False
