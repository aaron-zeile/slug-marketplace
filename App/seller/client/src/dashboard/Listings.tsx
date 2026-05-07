import React from 'react'
import FolderIcon from '@mui/icons-material/Folder'
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material'
import { useState, useEffect, useContext } from 'react'

import type { Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
// import { TaskContext } from '../task/Context'

import { list } from './model'

export default function SellerListings() {
  const errorCtx = useContext(ErrorContext)
  // const taskCtx = useContext(TaskContext)
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    void list(errorCtx?.setError ?? (() => { /* nullish coalesce */}), setListings);
  }, []); //[taskCtx?.task, errorCtx?.setError]);

  return (
    <List dense={true}>
      {listings.map((listing) => (
        <ListItem key={listing.id}>
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={listing.name}
          />
        </ListItem>
      ))}
    </List>
  )
}