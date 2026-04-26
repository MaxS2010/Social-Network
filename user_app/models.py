from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    username = models.CharField(
        max_length= 150,
        blank= True,
        null= True,
        unique= True
    )
    
    email = models.EmailField(
        unique= True
    )

    is_profile_complete = models.BooleanField(
        default=False
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []