import { Link, Outlet } from 'react-router-dom';
import { strings } from '../constants/strings';
import { useState, ReactNode } from 'react';
import * as colorSchemes from '../constants/colors';
import { ColorScheme } from '../constants/colors';
import logo from '../assets/TwistedTabby_FalloutLogo.PNG';

              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center font-bold gap-2"
                style={{ color: 'var(--main-accent)' }}
              >
                <img src={logo} alt="Twisted Tabby Logo" className="h-8 w-8" />
                {pageTitle}
              </Link> 