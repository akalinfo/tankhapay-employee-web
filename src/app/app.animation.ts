import { trigger, transition, style,state, animate,group ,query,animateChild,sequence,stagger} from '@angular/animations';


export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }), animate('600ms', style({ opacity: 1 }))]
  ),
  transition(':leave',
    [style({ opacity: 1 }), animate('600ms', style({ opacity: 0 }))]
  )
]);

export const slideInOut =  trigger('slideInOut', [
  transition(':enter', [
    style({transform: 'translateY(100%)'}),
    animate('700ms ease-in', style({transform: 'translateY(0%)'}))
  ]),
  transition(':leave', [
    animate('600ms ease-out', style({transform: 'translateY(100%)'}))
  ])
]);

export const slideInOutfade =  trigger('slideInOutfade', [
  transition(':enter', [
    style({transform: 'translateX(100%)',opacity: 0 , backgroundColor: 'rgb(120, 120, 120,0)'}),
    animate('100ms', style({backgroundColor: 'rgb(120, 120, 120,0.7)'})),
    animate('600ms ease-in', style({transform: 'translateX(0%)',opacity: 1 }))

  ]),
  transition(':leave', [
    style({ opacity: 1,backgroundColor: 'rgb(120, 120, 120,0.7)' }),
    animate('600ms ease-in', style({transform: 'translateX(100%)', opacity: 0})),
    animate('100ms', style({backgroundColor: 'rgb(120, 120, 120,0)'})),

  ])
]);

export const grooveState = trigger('grooveState', [
  state('inactive',
    style({
      background: 'rgb(120, 120, 120,0)',
      'display':'none'
    })
  ),
  state('active',
    style({
      background: 'rgb(120, 120, 120,0.7)',
      'display':'block'
    })
  ),
  transition('inactive => active',[
    group([
      style({
        'display':'block'
      }),
      query(':self', [ animate('400ms') ]),
      query('@dongleState', [ animateChild() ])
    ])
  ]),
  transition('active => inactive',[
    group([
      query('@dongleState', [ animateChild() ]),
      query(':self', [ animate('300ms') ]),
    ])
  ]),
])


export const dongleState = trigger('dongleState', [
  state('inactive',
    style({
      transform: 'translateX(100%)',
      opacity: 0,

    })
  ),
  state('active',
    style({
      transform: 'translateX(0%)',
      opacity: 1
    })
  ),
  transition('inactive <=> active',
    animate('500ms')
  ),
])


export const DropDownAnimation = trigger("dropDownMenu", [
  transition(":enter", [
    style({ height: 0, overflow: "hidden" }),
    query(".menu-item", [
      style({ opacity: 0, transform: "translateY(-50px)" })
    ]),
    query(".menu", [
      style({ opacity: 0, 'height':0 })
    ]),
    sequence([
      animate("200ms", style({ height: "*" })),
      query(".menu", [
        stagger(-50, [
          animate("300ms", style({ opacity: 1, 'height': 'auto' }))
        ])
      ]),
      query(".menu-item", [
        stagger(-50, [
          animate("400ms ease", style({ opacity: 1, transform: "none" }))
        ])
      ])
    ])
  ]),

  transition(":leave", [
    style({ height: "*", overflow: "hidden" }),
    query(".menu-item", [style({ opacity: 1, transform: "none" })]),
    query(".menu", [
      style({ opacity: 1, 'height': 'auto' })
    ]),
    sequence([
      query(".menu-item", [
        stagger(50, [
          animate(
            "400ms ease",
            style({ opacity: 0, transform: "translateY(-50px)" })
          )
        ])
      ]),
      query(".menu", [
        stagger(50, [
          animate(
            "300ms",
            style({ opacity: 0, 'height':0 })
          )
        ])
      ]),
      animate("200ms", style({ height: 0 }))
    ])
  ])
]);


export const detailExpand = trigger('detailExpand', [
  state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
  state('expanded', style({height: '*'})),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
])

